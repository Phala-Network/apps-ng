import { I18nProps } from '@polkadot/react-components/types';

import React, { useState, useEffect, useMemo } from 'react';
import { useHistory, useParams } from "react-router-dom";
import styled from 'styled-components';
import { Header, Divider, Card, Grid, Label, Icon, Rating } from 'semantic-ui-react';

import { Item } from './legacy/models';
import { pubkeyToCompany } from './legacy/utils';
import { usePhalaShared } from './context';
import ViewItem from './ViewItem';
import { Modal } from '@polkadot/react-components';
import PageContainer from './PageContainer';

import { hexToSs58 } from './utils';


interface Props extends I18nProps  {
  accountId: string | null;
  basePath: string
}

interface DatasetProps {
  basePath: string,
  className: string,
  item: Item;
}

function _Dataset ({ className = '', item, id }: DatasetProps): React.ReactElement | null {
  const [modal, setModal] = useState(false);
  const history = useHistory();

  const itemId = (parseInt(new URLSearchParams(history.location.search).get('itemId')));

  useEffect(() => {
    if (itemId === item.id) {
      setModal(true)
    }
  }, [itemId])

  const seller = useMemo(() => hexToSs58(`0x${item.seller}`), [item.seller])

  function handleClick() {
    setModal(true)
  }

  return <>
    <Card onClick={handleClick} className={className} raised={false} as='div'>
      <Card.Content>
      <Card.Header>{item.details.name}</Card.Header>
      </Card.Content>
      <Card.Content>
        <Grid>
          <Grid.Row>
            <Grid.Column width={10}>
              <Rating maxRating={5} defaultRating={4} icon='star' />
            </Grid.Column>
            <Grid.Column width={6}>
              已消费123次
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <br/>
        <p>商户: {seller}</p>
        <p>链上地址: {item.details.datasetLink}</p>
        <p>数据总数: 300万条</p>
        <p>数据大小: 2TB</p>
        <Label as='a' color='red' size="tiny">仅限TEE</Label> <Label color='green' size="tiny">已上链</Label>
        <p>数据描述: </p>
        <p style={{color: '#777', fontSize: 12}}>
          {item.details.description}
        </p>
        <p>价格:</p>
        <p style={{color: '#777', fontSize: 12}}>
          计价方式: 按量付费 <br/>
          价格: {parseFloat(item.details.price.PerRow.price)/1e14}元/条
        </p>
      </Card.Content>
      {modal && <Modal onClose={() => setModal(false)}>
        <Modal.Content>
          <ViewItem item={item} id={id} />
        </Modal.Content>
      </Modal>}
    </Card>
  </>
}

const Dataset = styled(_Dataset)`
  p {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

function Items ({ className, t }: Props): React.ReactElement<Props> | null {
  const history = useHistory();
  const { basePath, pApi, accountId } = usePhalaShared(); 
  const [dataItems, setDataItems] = useState<Array<Item>>([]);

  useEffect(() => {
    if (!accountId) {
      history.push(`${basePath}/settings`);
    }
  }, [accountId]);

  useEffect(() => {
    if (!pApi) { return }
    pApi.getItems()
      .then(res => {
        setDataItems(res?.GetItems?.items || []);
      });
  }, [pApi])

  return (
    <PageContainer fluid>
      <Header
        as='h2'
        content='数据商品市场'
      />
      <Divider />

      <GalleryWrapper>
        <AddCard />
        {
          dataItems.map((i, idx) => (
            <Dataset item={i} key={idx} id={idx} />
          ))
        }
      </GalleryWrapper>
    </PageContainer>
  )
}

const GalleryWrapper = styled(Card.Group)`
  /* display: flex; */
  width: 100%;

`

const AddCardContent = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  place-content: center;
`

const AddCard = () => {
  const history = useHistory();
  const { basePath } = usePhalaShared(); 

  return <Card onClick={() => history.push(`${basePath}/list`)} raised={false} as='div'>
    <AddCardContent>
      <Header icon>
        <Icon name='add' />
        新建商品
      </Header>
    </AddCardContent>
  </Card>;
}

export default Items;