import { useState } from "react";
import Button from "@/components/Button";
import Container from "@/components/Container";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Checkbox, Loading, useModal, useTheme } from "@zeit-ui/react";
import { observer } from "mobx-react";
import { useStore } from "@/store";
import { useApi } from "@polkadot/react-hooks";
import { FormatBalance as BalanceDisplay } from "@polkadot/react-query";
import BN from "bn.js";
import { hexToSs58 } from "@phala/runtime";
import IssueModal from "./IssueModal";
import ConvertToNativeModal from "./ConvertToNativeModal";
import DestroyButton from "./DestroyButton";

import {
  InfoFill as InfoFillIcon,
  Eye as EyeIcon,
  Send as SendIcon,
  Target as TargetIcon,
  PlusSquare as PlusSquareIcon,
} from "@zeit-ui/react-icons";
import { useEffect, useMemo } from "react";
import TransferModal from "./TransferModal";

const LeftDecorationWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  place-content: flex-start;
  margin: 0 36px 0 0;

  ${({ theme: { isXS } }) =>
    isXS &&
    `
    margin: 0 24px 0 0;
  `}
`;

const LeftDecorationTop = styled.div`
  width: 2px;
  height: 24px;
  background: #323232;
`;
const LeftDecorationBottom = styled.div`
  width: 2px;
  flex: 1;
  background: #323232;
`;
const LeftDecorationIcon = styled.div`
  width: 24px;
  height: 24px;
  margin: 3px 0;
`;

const LeftDecoration = () => {
  return (
    <LeftDecorationWrapper>
      <LeftDecorationTop />
      <LeftDecorationIcon>
        <TargetIcon color="#323232" size="24" />
      </LeftDecorationIcon>
      <LeftDecorationBottom />
    </LeftDecorationWrapper>
  );
};

const InfoWrapper = styled.div`
  color: #040035;
  --zeit-icons-background: #d1ff52;
  padding: 24px 0 21px;
  flex: 1;
`;
const InfoHead = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  margin: 0 0 21px;
`;
const InfoHeadMain = styled.h4`
  font-weight: 600;
  font-size: 27px;
  line-height: 32px;
  margin: 0 21px 0 0;
  color: #ff004d;
`;
const Balance = styled.div`
  display: flex;
  flex-direction: column;
`;
const BalanceHead = styled.h5`
  color: #9b9b9b;
  opacity: 0.64;
  margin: 0;
`;

const BalanceValue = styled(BalanceDisplay)`
  font-weight: 600;
  font-size: 36px;
  line-height: 43px;
  color: #f2f2f2;
  text-indent: -1px;
  margin: 0;
  white-space: break-spaces;
  word-break: break-word;

  & .ui--FormatBalance-value > .ui--FormatBalance-postfix {
    opacity: 1;
    font-weight: inherit;
  }
`;

const Info = ({ symbol, isPara, chainId, balance, children }) => {
  const balanceValue = useMemo(() => new BN(balance || "0"), [balance]);
  const { t } = useTranslation();

  return (
    <InfoWrapper>
      <InfoHead>
        <InfoHeadMain>
          {isPara ? `Para(${chainId})` : chainId}
          {chainId && " / "}
          {symbol}
        </InfoHeadMain>
      </InfoHead>
      <Balance>
        <BalanceHead>{t("balance")}</BalanceHead>
        <BalanceValue
          withCurrency={false}
          value={balanceValue}
          labelPost={` ${symbol}`}
          params={"dummy"}
        />
      </Balance>
      {children}
    </InfoWrapper>
  );
};

const HeadWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  padding: 0 36px 30px;

  ${({ theme: { isXS } }) =>
    isXS &&
    `
    flex-flow: column nowrap;
    align-items: flex-start;
  `}
`;

const HeadLine = styled.h3`
  font-weight: 600;
  font-size: 30px;
  line-height: 36px;
  font-feature-settings: "ss01" on, "ss05" on;
  margin: 0 24px 0 0;
`;

const HeadDesc = styled.p`
  font-size: 16px;
  line-height: 19px;
  color: #f2f2f2;
  margin: 0 0 5px;

  & > svg {
    vertical-align: text-top;
    margin-right: 6px;
  }

  ${({ theme: { isXS } }) =>
    isXS &&
    `
    font-size: 13px;
    line-height: 16px;
  `}
`;

const CheckboxWrapper = styled.div`
  flex: 1;
  ${({ theme: { isXS } }) =>
    isXS &&
    `
    margin: 24px 0 0 0;
  `}

  & label {
    display: block !important;
    font-size: 16px !important;
    line-height: 19px !important;
    color: #f2f2f2 !important;
    margin: 0 0 5px !important;
    height: unset !important;
  }

  & label .text {
    font-size: 16px !important;
  }
`;

const Head = observer(() => {
  const { wallet } = useStore();
  const { isXS } = useTheme();

  const { t } = useTranslation();

  return (
    <Container>
      <HeadWrapper>
        <HeadLine>{t("Secret assets")}</HeadLine>
        {!isXS && (
          <CheckboxWrapper>
            <Checkbox
              checked={!wallet.showInvalidAssets}
              onChange={wallet.setShowInvalidAssets}
            >
              {t("Hide assets with zero balance")}
            </Checkbox>
          </CheckboxWrapper>
        )}

        <HeadDesc>
          {!isXS && <InfoFillIcon size={18} />}
          {t("These assets are invisible on the chain.")}
        </HeadDesc>
        {isXS && (
          <CheckboxWrapper>
            <Checkbox
              checked={!wallet.showInvalidAssets}
              onChange={wallet.setShowInvalidAssets}
            >
              {t("Hide assets with zero balance")}
            </Checkbox>
          </CheckboxWrapper>
        )}
      </HeadWrapper>
    </Container>
  );
});

const SecretBlockWrapper = styled.div`
  width: 100%;
  margin: 0;
  display: flex;
  flex-flow: row nowrap;
  padding: 0 36px 0 24px;
  box-shadow: 0 0 0 2px #323232 inset;
  box-sizing: border-box;
  border-radius: 9px;
`;

const SecretBlock = ({ children, ...props }) => {
  return (
    <Container>
      <SecretBlockWrapper {...props}>{children}</SecretBlockWrapper>
    </Container>
  );
};

const PHAButtonGroup = ({ convertToNativeModal, transferModal }) => {
  const { t } = useTranslation();

  return (
    <Button.Group>
      <Button
        type="primaryLight"
        icon={EyeIcon}
        name={t("Convert to PHA")}
        onClick={() => convertToNativeModal.setVisible(true)}
      />
      <Button
        type="secondaryLight"
        icon={SendIcon}
        name={t("Secret Transfer")}
        onClick={() => transferModal.setVisible(true)}
      />
    </Button.Group>
  );
};

const PHA = observer(() => {
  const { wallet } = useStore();
  const convertToNativeModal = useModal();
  const transferModal = useModal();

  const { isXS } = useTheme();

  const { t } = useTranslation();

  useEffect(() => {
    wallet.updateMainAsset();

    const interval = setInterval(() => {
      try {
        wallet.updateMainAsset();
      } catch (e) {
        console.warn(e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [wallet]);

  return (
    <>
      <ConvertToNativeModal {...convertToNativeModal} />
      <TransferModal {...transferModal} />
      <SecretBlock>
        <LeftDecoration />
        <Info symbol={t("Secret PHA")} balance={wallet.mainAsset?.balance}>
          {isXS && (
            <PHAButtonGroup
              convertToNativeModal={convertToNativeModal}
              transferModal={transferModal}
            />
          )}
        </Info>
        {!isXS && (
          <PHAButtonGroup
            convertToNativeModal={convertToNativeModal}
            transferModal={transferModal}
          />
        )}
      </SecretBlock>
    </>
  );
});

const IssueLine = styled.p`
  margin: 0 0 0 12px;
  width: 100%;
  text-align: center;
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  color: #f2f2f2;
  margin: 21px 0;

  & > svg {
    vertical-align: -8px;
    margin: 3px 18px 3px 3px;
  }
`;
const IssueBlock = styled(SecretBlock)`
  margin: 21px 0;
  cursor: pointer;
  transition: opacity 0.2s;

  &:active,
  &:hover {
    opacity: 0.72;
  }
`;

const Issue = () => {
  const issueModal = useModal();
  const { t } = useTranslation();

  return (
    <>
      <IssueModal {...issueModal} />
      <IssueBlock onClick={() => issueModal.setVisible(true)}>
        <IssueLine>
          <PlusSquareIcon size={24} />
          {t("issue secret token")}
        </IssueLine>
      </IssueBlock>
    </>
  );
};

const AssetBlock = styled(SecretBlock)`
  margin: 0 0 18px 0;
  cursor: default;
`;

const AssetItemButtonGroup = ({ isOwner, isParaChain, item }) => {
  const { t } = useTranslation();
  const transferModal = useModal();

  return (
    <>
      <TransferModal
        asset={item.metadata}
        isParaChain={isParaChain}
        {...transferModal}
      />
      <Button.Group>
        <Button
          type="secondaryLight"
          icon={SendIcon}
          name={t("Secret Transfer")}
          onClick={() => transferModal.setVisible(true)}
        />
        {isParaChain && (
          <Button
            type="secondaryLight"
            icon={SendIcon}
            name={t("Parachain Withdraw")}
            onClick={() => transferModal.setVisible(true)}
          />
        )}
        {isOwner && <DestroyButton {...item.metadata} />}
      </Button.Group>
    </>
  );
};

const AssetItem = observer(({ itemIndex }) => {
  const { api } = useApi();

  const {
    wallet,
    account: { address },
  } = useStore();

  const item = wallet.assets[itemIndex];
  const [symbol, setSymbol] = useState(item.metadata.symbol || "-");
  const [isParaChain, setIsParaChain] = useState(false);
  const [chainId, setChainId] = useState(null);

  useEffect(() => {
    const {
      metadata: { id },
    } = item;
    const isNativeAsset =
      id?.length === 4 &&
      id[0] === 0 &&
      id[1] === 0 &&
      id[2] === 0 &&
      id[3] === 0;
    if (!isNativeAsset) {
      const rawData = api.createType("MultiLocation", Uint8Array.from(id)).asX3;
      const chainId = rawData[1].asParachain.toJSON();
      const chainName = rawData[2].asGeneralKey.toHuman();
      setSymbol(chainName);
      setChainId(chainId);
      setIsParaChain(true);
    }
  }, [item]);

  const { isXS } = useTheme();

  const { showInvalidAssets } = wallet;
  const balance = useMemo(() => new BN(item.balance || "0"), [item.balance]);
  const ownerAddress = useMemo(() => hexToSs58("0x" + item.metadata.owner), [
    item.metadata.owner,
  ]);
  const isOwner = useMemo(() => ownerAddress === address, [
    ownerAddress,
    address,
  ]);

  if (!isOwner && balance.isZero() && !showInvalidAssets) {
    return null;
  }

  return (
    <>
      <AssetBlock>
        <LeftDecoration />
        <Info
          balance={balance}
          symbol={symbol}
          chainId={chainId}
          isPara={!!chainId}
        >
          {isXS && (
            <AssetItemButtonGroup
              isOwner={isOwner}
              isParaChain={isParaChain}
              item={item}
            />
          )}
        </Info>
        {!isXS && (
          <AssetItemButtonGroup
            isOwner={isOwner}
            isParaChain={isParaChain}
            item={item}
          />
        )}
      </AssetBlock>
    </>
  );
});

const Assets = observer(() => {
  const { wallet } = useStore();

  useEffect(() => {
    wallet.updateAssets();

    const interval = setInterval(() => {
      try {
        wallet.updateAssets();
      } catch (e) {
        console.warn(e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [wallet]);

  return wallet.assets ? (
    wallet.assets.map((item, index) => (
      <AssetItem key={`Assets-${item.metadata.id}`} itemIndex={index} />
    ))
  ) : (
    <Loading size="large" />
  );
});

export default () => {
  return (
    <>
      <Head />
      <PHA />
      <Issue />
      <Assets />
    </>
  );
};
