import { ApiProps } from '@polkadot/react-api/types';
import { I18nProps } from '@polkadot/react-components/types';

import React, {useState, useEffect, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Grid, Header, Icon, Rating, Table, Button } from 'semantic-ui-react';
import * as Papa from 'papaparse';

import { Item, fmtAmount } from './legacy/models';
import { genTablePreview, genDataLabel, genDataLabels, isSamePerson, pubkeyToCompany } from './legacy/utils';
import { usePhalaShared } from './context';
import { hexToSs58 } from './utils';

interface Props {
  basePath: string;
  accountId: string | undefined;
}

const defaultItem: Item = {
  id: 0,
  seller: '',
  txref: { blocknum: 0, index: 0},
  details: {
    category: 'null',
    datasetLink: '/null',
    datasetPreview: '',
    description: '',
    name: '',
    price: {PerRow: {price: '0'}},
  },
}

function genTable (csv: string) {
  const dataset = Papa.parse(csv);
  if (dataset.errors.length > 0) {
    return (<div>暂无预览</div>);
  }
  const header = dataset.data[0] as Array<string>;
  const rows = dataset.data.slice(1) as Array<Array<string>>;
  return genTablePreview(header, rows);
}

export default function _ViewItem({ setModal, item, id }): React.ReactElement<Props> | null {

  const { basePath, accountId } = usePhalaShared();

  const history = useHistory();

  function handleBuy () {
    history.push(`${basePath}/list/orders/new/${id}`);
  }

  const [accepted, setAccepted] = useState<boolean>(false);

  const imSeller = useMemo(() => {
    return !!(accountId && isSamePerson(accountId, item.seller));
  }, [accountId, item])

  const seller = useMemo(() => hexToSs58(`0x${item.seller}`), [item.seller])

  return (
    <div>
      <h1>数据商品详情</h1>

      <hr />

      <h2>基本信息</h2>
      <Header as='h3'>{item.details.name}</Header>
      {genDataLabels([
        ['上传时间', '2018-03-05'],
        ['计价方式', item.details.price.PerRow ? '按量付费' : '其他'],
        ['ID', (10000 + item.id).toString()],
        ['数据总数', '1万条'],
        ['价格', fmtAmount(item.details.price.PerRow.price) + ' 元/条'],
        ['商户', seller],
        ['数据大小', '2TB']
      ])}

      <hr />

      <h2>服务信息</h2>
      <Grid stackable>
        <Grid.Column width={5}>
          <Grid columns={1}>
            <Grid.Column>{genDataLabel('数据安全', '已加密，仅限可信环境交易')}</Grid.Column>
            <Grid.Column>{genDataLabel('数据环境', '已上传 ' + item.details.datasetLink, 'text-ellipsis')}</Grid.Column>
            <Grid.Column>{genDataLabel('交易记录', '201次')}</Grid.Column>
          </Grid>
        </Grid.Column>
        <Grid.Column width={11}>
          <Grid columns={1}>
            <Grid.Column>{genDataLabel('数据质量', (<Rating maxRating={5} defaultRating={4} icon='star' size="large" />))}</Grid.Column>
            <Grid.Column>{genDataLabel('数据描述', item.details.description)}</Grid.Column>
          </Grid>
        </Grid.Column>
      </Grid>

      <hr />

      <h2>数据预览</h2>
      {genTable(item.details.datasetPreview)}

      <hr />

      <h2>链上记录</h2>
      <Table celled padded fixed>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>操作时间</Table.HeaderCell>
            <Table.HeaderCell>提交地址</Table.HeaderCell>
            <Table.HeaderCell>查询数量</Table.HeaderCell>
            <Table.HeaderCell>预计收入</Table.HeaderCell>
            <Table.HeaderCell>数据交易类型</Table.HeaderCell>
            <Table.HeaderCell>详情</Table.HeaderCell>
            <Table.HeaderCell>操作</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.Cell>2019-11-15 12:03</Table.Cell>
            <Table.Cell>//Bob</Table.Cell>
            <Table.Cell>5</Table.Cell>
            <Table.Cell>5</Table.Cell>
            <Table.Cell>模版-Join</Table.Cell>
            <Table.Cell>预置模版-建议通过</Table.Cell>
            <Table.Cell>
              { imSeller && !accepted && (
                <>
                  <a onClick={()=>{setAccepted(true)}}>通过</a> | <a onClick={()=>{alert('refuse')}}>拒绝</a>
                </>
              )}
              { accepted && '已通过' }
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>2019-11-13 14:10</Table.Cell>
            <Table.Cell>//Bob</Table.Cell>
            <Table.Cell>1200</Table.Cell>
            <Table.Cell>1200</Table.Cell>
            <Table.Cell>自定义合约</Table.Cell>
            <Table.Cell><Icon name='exclamation circle' color='yellow' />建议审核代码</Table.Cell>
            <Table.Cell></Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>

      {!imSeller && <Grid>
        <Grid.Row style={{
          placeContent: 'center',
          margin: '12px 0 6px'
        }}>
          <Button primary onClick={handleBuy}>购买</Button>
        </Grid.Row>
      </Grid>}
    </div>
  )
}
