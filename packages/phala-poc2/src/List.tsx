import { Modal, Button as PButton, TxButton, InputAddress } from '@polkadot/react-components';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useHistory } from "react-router-dom";
import { useApi, useCall } from '@polkadot/react-hooks';
import { useDropzone } from 'react-dropzone'
import { Button, Divider, Form, Grid, Input, Select, Header, Modal as SModal } from 'semantic-ui-react';
import * as Papa from 'papaparse';

import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';

import useForm, { FormContext, useFormContext } from 'react-hook-form';

import { UploadContainer, genTablePreview, fileToIpfsPath, readTextFileAsync, sleep, isSamePerson, pubkeyToCompany  } from './legacy/utils';
import { amountFromNL } from './legacy/models'
import { usePhalaShared } from './context';
import PageContainer from './PageContainer';
import { u8aToHexCompact } from './utils';

// import imgIpfsSvg from './assets/ipfs-logo-vector-ice-text.svg';


const categories = [
  { key: 'c1', value: '征信数据', text: '征信数据' },
  { key: 'c2', value: '语料库', text: '语料库' },
  { key: 'c3', value: '图像', text: '图像' },
  { key: 'c4', value: '语音', text: '语音' },
  { key: 'c5', value: '其他', text: '其他' },
];

const accoutingType = [
  { key: 'c1', value: 'c1', text: '按行付费' },
  { key: 'c2', value: 'c2', text: '类别二', disabled: true },
  { key: 'c3', value: 'c3', text: '类别三', disabled: true },
];

function useFormUpdate(setValue: Function, triggerValidation: Function) {
  return async (e, { name, value }) => {
    setValue(name, value);
    await triggerValidation({ name });
  }
}

interface StepBasicProps {
  onDatasetReady: (file: File) => void;
}

function StepBasic({ onDatasetReady }: StepBasicProps): React.ReactElement<StepBasicProps> | null {
  const { register, setValue, triggerValidation, errors } = useFormContext();
  const formUpdate = useFormUpdate(setValue, triggerValidation);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length == 0) {
      return;
    }
    const file = acceptedFiles[0];
    onDatasetReady(file);
  }, [])

  const {
    getRootProps, getInputProps,
    isDragActive, isDragAccept, isDragReject
  } = useDropzone({ onDrop });

  useEffect(() => {
    register({ name: "sellerName" }, { required: true });
    register({ name: "name" }, { required: true });
    register({ name: "category" }, { required: true });
  }, [])

  return (
    <>
      <Header
        as='h3'
        content='基本信息'
      />

      <Grid stackable>
        <Grid.Row verticalAlign='middle'>
          <Grid.Column width={2} textAlign='right'>商户名称</Grid.Column>
          <Grid.Column width={6}>
            <Form.Input name="sellerName" onChange={formUpdate} error={!!errors.sellerName} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row verticalAlign='middle'>
          <Grid.Column width={2} textAlign='right'>商品名称</Grid.Column>
          <Grid.Column width={6}>
            <Form.Input name="name" onChange={formUpdate} error={!!errors.name} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row verticalAlign='middle'>
          <Grid.Column width={2} textAlign='right'>数据品类</Grid.Column>
          <Grid.Column width={6}>
            <Form.Select
              name="category" onChange={formUpdate} error={errors.category ? true : false}
              placeholder='请选择品类' options={categories}
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row verticalAlign='top'>
          <Grid.Column width={2} textAlign='right'>数据文件</Grid.Column>
          <Grid.Column width={6}>
            <UploadContainer {...getRootProps({ isDragActive, isDragAccept, isDragReject })}>
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
        {/* <Grid.Row>
          <Button primary>下一步</Button>
          <Button secondary>取消</Button>
        </Grid.Row> */}
      </Grid>
    </>
  );
}

interface DatasetState {
  header: Array<string> | null;
  rows: Array<Array<string>> | null;
  file: File | null;
  ipfs_path: string;
}

interface StepDetailsProps {
  dataset: DatasetState;
}

function StepDetails({ dataset }: StepDetailsProps): React.ReactElement<StepDetailsProps> | null {
  const { createCommand } = usePhalaShared();
  const history = useHistory();
  const { register, setValue, triggerValidation, errors, watch } = useFormContext();
  const formUpdate = useFormUpdate(setValue, triggerValidation);
  const [showRowPrice, setShowRowPrice] = useState(false);
  const dataPreviewDefault = useMemo(() => {
    if (!dataset.header || !dataset.rows) {
      return '';
    }
    return dataset.header.join(',') + '\n';
  }, [dataset])
  const formData = watch();

  const contractParamsRaw = useMemo(() => {
    const displayPrice = formData['price.PerRow.displayPrice'];
    const amount = amountFromNL(displayPrice);
    delete formData['price.PerRow.displayPrice'];
    return {
      List: {
        price: { PerRow: { displayPrice: amount } },
        ...formData
      }
    };
  }, [formData])

  const contractParams = useMemo(() => {
    const json = JSON.stringify(contractParamsRaw, undefined, 2);
    return `phalaModule.push_command(ContractMarketplace, $encrypted(${json}))`
  }, [contractParamsRaw])

  // const contractParamsSent = useMemo(() => {
  //   return `phalaModule.push_command(ContractMarketplace, $encrypted(${createCommand(contractParamsRaw)}))`
  // }, [contractParamsRaw])


  function handleAccountType() {
    setShowRowPrice(true);
  }

  function handleCancel() {
    history.goBack();
  }

  useEffect(() => {
    register({ name: 'dataset_preview' }, { required: true });
    register({ name: 'price.PerRow.displayPrice', type: 'number' }, { required: true });
    register({ name: 'description' }, { required: true });
  }, []);

  return (
    <>
      <Header
        as='h3'
        content='数据信息'
      />

      <Grid>
        <Grid.Row>
          <Grid.Column width={2} textAlign='right'>即将发布</Grid.Column>
          <Grid.Column width={10}>
            {genTablePreview(dataset.header, dataset.rows)}
            {dataset.ipfs_path && (
              <>
                {/* <img src={imgIpfsSvg} className="icon ipfs" /> */}
                {dataset.ipfs_path}
              </>
            )}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={2} textAlign='right'>预览数据(展示用)</Grid.Column>
          <Grid.Column width={10}>
            <Form.TextArea name="dataset_preview" onChange={formUpdate}
              error={!!errors.dataset_preview}
              placeholder={dataPreviewDefault} />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row verticalAlign='middle'>
          <Grid.Column width={2} textAlign='right'>计价方式</Grid.Column>
          <Grid.Column width={4}>
            <Select placeholder='请选择' options={accoutingType} onChange={handleAccountType} />
          </Grid.Column>
          {showRowPrice ? (
            <>
              <Grid.Column width={2} textAlign='right'>字段定价</Grid.Column>
              <Grid.Column width={4}>
                <Input name="price.PerRow.displayPrice" onChange={formUpdate}
                  error={!!errors.price}
                  label={{ color: 'yellow', content: 'tCNY' }} labelPosition='right' />
              </Grid.Column>
            </>) : <></>
          }
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={2} textAlign='right'>确认合约参数</Grid.Column>
          <Grid.Column width={10}>
            <SyntaxHighlighter language='javascript' showLineNumbers>
              {contractParams}
            </SyntaxHighlighter>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={2} textAlign='right'>填写数据描述</Grid.Column>
          <Grid.Column width={10}>
            <Form.TextArea name="description" onChange={formUpdate} error={!!errors.description}
              placeholder='请输入内容' />
          </Grid.Column>
        </Grid.Row>
        <Divider />
        <Grid.Row style={{
          margin: '-6px 24px 12px'
        }}>
          <Button type="submit" primary>下一步</Button>
          <Button secondary onClick={handleCancel}>返回</Button>
        </Grid.Row>
      </Grid>
    </>
  );
}

interface Props {
  basePath: string;
  accountId: string | null;
}

export default function List(props: Props): React.ReactElement<Props> | null {
  const { basePath, accountId, createCommand, pApi, keypair } = usePhalaShared();

  const contractId = useRef(1).current;

  const history = useHistory();
  const formMethods = useForm();
  const [datasetState, setDatasetState] = useState<DatasetState>({ header: null, rows: null, file: null, ipfs_path: '' });
  const [submitTxOpen, setSubmitTxOpen] = useState<boolean>(false);
  const [commandIssue, setCommandIssue] = useState('');
  const [successWait, setSuccessWait] = useState(false);
  const { api } = useApi();
  const bestNumber = useCall(api.derive.chain.bestNumber, []);
  const [blockBeforeSubmit, setBlockBeforeSubmit] = useState<BlockNumber | undefined>(null);

  function handleDatasetReady(file: File) {
    Papa.parse(file, {
      complete: async function (dataset) {
        const ipfsPath = await fileToIpfsPath(file);
        const fileData = await readTextFileAsync(file);
        const result = await pApi.setFile(ipfsPath, fileData);

        setDatasetState({
          header: dataset.data[0] as Array<string>,
          rows: dataset.data.slice(1, 10) as Array<Array<string>>,
          file: file,
          ipfs_path: ipfsPath,
        });
      }
    })
  }

  useEffect(() => {
    if (!accountId) {
      history.push(`${basePath}/settings`);
    }
  }, [accountId]);

  async function onSubmit(values: Object) {
    if (!bestNumber) {
      alert('Substrate网络异常，无法获取最新区块高度');
      return;
    }
    if (!datasetState.ipfs_path) {
      alert('请选择上传文件');
      return;
    }
    const { name, category, dataset_preview, description, price } = values as any;
    const amount = amountFromNL(parseInt(price.PerRow.displayPrice));
    const normalized = {
      List: {
        name, category, dataset_preview, description,
        price: { PerRow: { price: amount } },
        dataset_link: datasetState.ipfs_path
      }
    };

    setCommandIssue(await createCommand(normalized));
    setBlockBeforeSubmit(bestNumber);
    setSubmitTxOpen(true);
  }

  function onClose() {
    setSubmitTxOpen(false);
  }

  const handleSuccess = useCallback(async (...props) => {
    const pk = u8aToHexCompact(keypair?.publicKey);
    const refBlock = parseInt(blockBeforeSubmit!.toString());
    setSuccessWait(true);
    console.log(`tx submitted. waiting from ${refBlock}`, props)
    let myItems: Array = [];
    for (let i = 0; i < 20; i++) {
      const { GetItems: { items } } = await pApi.getItems();
      console.log(items)
      myItems = items.filter((o) => (o.txref.blocknum > refBlock && pk === o.seller));
      if (myItems.length > 0) {
        // found!
        const item = myItems[myItems?.length - 1];
        console.log('Navigating to', `${basePath}?itemId=${item.id}`, item);
        history.push(`${basePath}?itemId=${item.id}`);
        return;
      }
      console.log('waiting for order creation');
      await sleep(2000);
    }
    alert('创建交易超时');
    setSuccessWait(false);
  }, [keypair, accountId, pApi, blockBeforeSubmit]); 

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
        content='数据商品市场'
      />
      <Divider />

      <FormContext {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <StepBasic onDatasetReady={handleDatasetReady} />
          <StepDetails dataset={datasetState} />
        </Form>
      </FormContext>

      <Modal open={submitTxOpen} header='提交合约请求'>
        <Modal.Content>
          <InputAddress
            className='medium'
            defaultValue={accountId}
            isDisabled
            label='账号'
          />
        </Modal.Content>
        <Modal.Content>
          <PButton.Group>
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
              params={[contractId, commandIssue]}
              tx='phalaModule.pushCommand'
              onSuccess={handleSuccess}
              onStart={() => setSuccessWait(true)}
              onFailed={() => setSuccessWait(false)}
            />
          </PButton.Group>
        </Modal.Content>
      </Modal>
    </PageContainer>
  )
}
