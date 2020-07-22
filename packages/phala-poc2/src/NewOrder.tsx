import { BlockNumber } from '@polkadot/types/interfaces';
import { useApi, useCall } from '@polkadot/react-hooks';
import { Modal, Button as PButton, TxButton, InputAddress } from '@polkadot/react-components';

import React, {useEffect, useState, useCallback, useMemo} from 'react';
import { useHistory, useParams } from "react-router-dom";
import { useDropzone } from 'react-dropzone'
import { Button, Divider, Grid, Header, Modal as SModal, Label, TextArea, Table } from 'semantic-ui-react';
import * as Papa from 'papaparse';

import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';

import { UploadContainer, genDataLabels, genTablePreview, fileToIpfsPath, readTextFileAsync, sleep, isSamePerson, pubkeyToCompany } from './legacy/utils';
import { Item, defaultItem, CsvTablePreview, fmtAmount, Order } from './legacy/models'
// import { getItem, set as setFile, getOrders } from './API';
import { usePhalaShared } from './context';
import PageContainer from './PageContainer';
import { ss58ToHex, u8aToHexCompact } from './utils';

// import imgIpfsSvg from './assets/ipfs-logo-vector-ice-text.svg';

interface Props {
  basePath: string;
  accountId: string | null;
}

export default function NewOrder(props: Props): React.ReactElement<Props> | null {
  // const app = React.useContext(AppContext.Context);
  const history = useHistory();
  const { pApi, basePath, accountId, createCommand, keypair } = usePhalaShared();

  useEffect(() => {
    if (!accountId) {
      history.push(`${basePath}/settings`);
    }
  }, [accountId]);

  // items

  const { value } = useParams();
  const [item, setItem] = useState<Item>(defaultItem());
  const [successWait, setSuccessWait] = useState(false);

  useEffect(()=> {
    if (!pApi) { return }
    (async () => {
      const resultItem = await pApi.getItem(parseInt(value!));
      setItem(resultItem);
    })();
  }, [pApi, value]);

  // drop

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length == 0) {
      return;
    }
    const file = acceptedFiles[0];
    setCsvFile(file);
  }, [])

  const {
    getRootProps, getInputProps,
    isDragActive, isDragAccept, isDragReject
  } = useDropzone({onDrop});

  useEffect(() => {
    if (!csvFile) return;
    if (!pApi) return;
    (async () => {
      const ipfsPath = await fileToIpfsPath(csvFile);
      const fileData = await readTextFileAsync(csvFile)
      const result = await pApi.setFile(ipfsPath, fileData);
      console.log('set file', ipfsPath, result);
      setPushCommandParams((p) => {
        const newp = {...p};
        newp.OpenOrder.queryLink = ipfsPath;
        return newp;
      });

      Papa.parse(csvFile, {
        complete: function (dataset) {
          const header = dataset.data[0];
          const rows = dataset.data.slice(1, 10);
          setTablePreview({header, rows})
        }
      })
    })();
  }, [csvFile, pApi])

  // preview

  const [tablePreview, setTablePreview] = useState<CsvTablePreview>({
    header: null,
    rows: null
  });

  // submit

  const { api } = useApi();
  const [blockBeforeSubmit, setBlockBeforeSubmit] = useState<BlockNumber | undefined>(null);
  const bestNumber = useCall<BlockNumber>(api.derive.chain.bestNumber, []);

  function handleCancel () {
    history.goBack();
  }

  const [pushCommandParams, setPushCommandParams] = useState({
    OpenOrder: {
      itemId: parseInt(value!),
      queryLink: ''
    }
  });
  const [commandIssue, setCommandIssue] = useState('')

  const contractParams = useMemo(() => {
    return `phalaModule.push_command(ContractMarketplace, ${JSON.stringify(pushCommandParams, undefined, 2)})`;
  }, [pushCommandParams])

  useEffect(() => {
    if (!createCommand) { return }
    if (!pushCommandParams) { return }
    (async () => {
      setCommandIssue(await createCommand(pushCommandParams))
    })()
  }, [createCommand, pushCommandParams])

  const [submitTxOpen, setSubmitTxOpen] = useState<boolean>(false);
  function handleSubmitTx () {
    if (!bestNumber) {
      alert('Substrate网络异常，无法获取最新区块高度');
      return;
    }
    if (!csvFile) {
      alert('请先上传文件');
      return;
    }
    setBlockBeforeSubmit(bestNumber);
    setSubmitTxOpen(true);
  }
  function onClose() {
    setSubmitTxOpen(false);
  }

  //  onchain operation
  
  async function handleSuccess() {
    const pk = u8aToHexCompact(keypair?.publicKey);
    const refBlock = parseInt(blockBeforeSubmit!.toString());
    setSuccessWait(true);
    console.log(`tx submitted. waiting from ${refBlock}`)
    let myOrders: Array<Order> = [];
    for (let i = 0; i < 20; i++) {
      const { GetOrders: { orders } } = await pApi.getOrders();
      console.log(orders);
      myOrders = orders.filter((o) => (o.txref.blocknum > refBlock && pk === o.buyer));
      if (myOrders.length > 0) {
        // found!
        const order = myOrders[myOrders?.length - 1];
        console.log('Navigating to', `${basePath}/list/result/order/${order.id}`, order);
        history.push(`${basePath}/list/result/order/${order.id}`);
        return;
      }
      console.log('waiting for order creation');
      await sleep(2000);
    }
    alert('创建交易超时');
    setSuccessWait(false);
  }

  return (
    <PageContainer fluid>
      <SModal
        open={successWait}
        size='small'
        actions={['Snooze', { key: 'done', content: 'Done', positive: true }]}
      >
        <Header icon='browser' content='正在处理购买请求' />
        <Modal.Content>
          <h3>处理完成后将自动跳转至结果页面，请稍候。</h3>
        </Modal.Content>
      </SModal>
      <Header
        as='h2'
        content='购买商品'
      />
      <hr/>

      <Header
        as='h3'
        content='基本信息'
      />
      <Grid stackable>
        <Grid.Column width={5}>
          <Header as='h3'>{item.details.name}</Header>
        </Grid.Column>
        {genDataLabels([
          ['上传时间', '2018-03-05'],
          ['计价方式', item.details.price.PerRow ? '按量付费' : '其他'],
          ['ID', (10000 + item.id).toString()],
          ['数据总数', '1万条'],
          ['价格', fmtAmount(item.details.price.PerRow.price) + ' 元/条'],
          ['商户', pubkeyToCompany[item.seller]],
          ['数据大小', '2TB']
        ])}
      </Grid>
      <Grid>
        <Grid.Row verticalAlign='top'>
            <Grid.Column width={2} textAlign='right'>查询文件</Grid.Column>
            <Grid.Column width={6}>
              <UploadContainer {...getRootProps({isDragActive, isDragAccept, isDragReject})}>
                <input {...getInputProps()} />
                {
                  isDragActive ?
                    <p>松开上传</p> :
                    <p>将文件拖拽到此处，或点击上传</p>
                }
              </UploadContainer>
              <p>CSV文件，不超过1G</p>
              <p className='text-primary'>您的数据将经过本地加密后才会上传，所有的计算仅在可信执行环境内完成。任何人、程序获取数据都将经由您的代码审核后才能实现。</p>
            </Grid.Column>
          </Grid.Row>
      </Grid>

      <Header
        as='h2'
        content='请求数据'
      />
      <Grid>
        <Grid.Row>
          <Grid.Column width={2} textAlign='right'>请求数据</Grid.Column>
          <Grid.Column width={10}>
            {genTablePreview(tablePreview.header, tablePreview.rows)}
            {pushCommandParams.OpenOrder.queryLink && (
              <>
                {/* <img src={imgIpfsSvg} className="icon ipfs" /> */}
                {pushCommandParams.OpenOrder.queryLink}
              </>
            )}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row verticalAlign='top'>
          <Grid.Column width={2} textAlign='right'>字段关联</Grid.Column>
          <Grid.Column width={10}>
              <SyntaxHighlighter language='sql' showLineNumbers>
                SELECT *
                FROM query JOIN dataset on (query.phone == dataset.phone)
              </SyntaxHighlighter>
            <pre>

            </pre>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row verticalAlign='top'>
          <Grid.Column width={2} textAlign='right'>合约参数预览</Grid.Column>
          <Grid.Column width={10}>
            <SyntaxHighlighter language='javascript' showLineNumbers>
                {contractParams}
              </SyntaxHighlighter>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={2} textAlign='right'>选择可信矿工</Grid.Column>
          <Grid.Column width={10}>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>矿工地址</Table.HeaderCell>
                  <Table.HeaderCell>相对算力</Table.HeaderCell>
                  <Table.HeaderCell>价格</Table.HeaderCell>
                  <Table.HeaderCell>节点状态</Table.HeaderCell>
                  <Table.HeaderCell>操作</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>102.8.75.3</Table.Cell>
                  <Table.Cell>2.0x</Table.Cell>
                  <Table.Cell>-</Table.Cell>
                  <Table.Cell><Label color='green'>在线</Label></Table.Cell>
                  <Table.Cell><Label color='grey'>已选择</Label></Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>43.219.62.220</Table.Cell>
                  <Table.Cell>1.5x</Table.Cell>
                  <Table.Cell>-</Table.Cell>
                  <Table.Cell><Label color='yellow'>离线</Label></Table.Cell>
                  <Table.Cell></Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>18.21.5.102</Table.Cell>
                  <Table.Cell>1.5x</Table.Cell>
                  <Table.Cell>-</Table.Cell>
                  <Table.Cell><Label color='yellow'>离线</Label></Table.Cell>
                  <Table.Cell></Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </Grid.Column>
        </Grid.Row>

        <Divider />
        <Grid.Row style={{
          margin: '-6px 24px 12px'
        }}>
          <Button primary onClick={handleSubmitTx}>下一步</Button>
          <Button secondary onClick={handleCancel}>返回</Button>
        </Grid.Row>
      </Grid>


      <Modal open={submitTxOpen} header='提交合约请求'>
        <Modal.Content>
          <div>
              <InputAddress
                className='medium'
                defaultValue={accountId}
                isDisabled
                label='账号'
              />
          </div>
        </Modal.Content>
        <Modal.Content>
          <PButton
            icon='window-close'
            isNegative
            label='取消'
            onClick={onClose}
          />
          <TxButton
            accountId={accountId}
            icon='paper-plane'
            label='提交'
            params={[1, commandIssue]}
            tx='phalaModule.pushCommand'
            onSuccess={handleSuccess}
            onStart={() => setSuccessWait(true)}
            onFailed={() => setSuccessWait(false)}
          />
        </Modal.Content>
      </Modal>
    </PageContainer>
  )
}