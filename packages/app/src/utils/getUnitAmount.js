
import BN from 'bn.js';
import { BN_ZERO, BN_TEN, formatBalance } from '@polkadot/util';
import { BitLengthOption } from '@polkadot/react-components/constants';

export const DEFAULT_BITLENGTH = BitLengthOption.CHAIN_SPEC;

export const TokenUnit = (() => {
    class TokenUnit {
        static setAbbr(abbr = TokenUnit.abbr) {
            TokenUnit.abbr = abbr;
        }
    }
    TokenUnit.abbr = 'Unit';
    return TokenUnit;
})();

function getGlobalMaxValue(bitLength) {
    return new BN(2).pow(new BN(bitLength || DEFAULT_BITLENGTH)).subn(1);
}
function getRegex(isDecimal) {
    const decimal = '.';
    return new RegExp(isDecimal
        ? `^(0|[1-9]\\d*)(\\${decimal}\\d*)?$`
        : '^(0|[1-9]\\d*)$');
}
export function getSiOptions() {
    return formatBalance.getOptions().map(({ power, text, value }) => ({
        text: power === 0
            ? TokenUnit.abbr
            : text,
        value
    }));
}
function getSiPowers(si) {
    if (!si) {
        return [BN_ZERO, 0, 0];
    }
    const basePower = formatBalance.getDefaults().decimals;
    return [new BN(basePower + si.power), basePower, si.power];
}
function isValidNumber(bn, bitLength, isZeroable, maxValue) {
    if (
    // cannot be negative
    bn.lt(BN_ZERO) ||
        // cannot be > than allowed max
        !bn.lt(getGlobalMaxValue(bitLength)) ||
        // check if 0 and it should be a value
        (!isZeroable && bn.isZero()) ||
        // check that the bitlengths fit
        bn.bitLength() > (bitLength || DEFAULT_BITLENGTH) ||
        // cannot be > max (if specified)
        (maxValue && maxValue.gtn(0) && bn.gt(maxValue))) {
        return false;
    }
    return true;
}
function inputToBn(input, si, bitLength, isZeroable, maxValue) {
    const [siPower, basePower, siUnitPower] = getSiPowers(si);
    // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
    const isDecimalValue = input.match(/^(\d+)\.(\d+)$/);
    let result;
    if (isDecimalValue) {
        if (siUnitPower - isDecimalValue[2].length < -basePower) {
            result = new BN(-1);
        }
        const div = new BN(input.replace(/\.\d*$/, ''));
        const modString = input.replace(/^\d+\./, '');
        const mod = new BN(modString);
        result = div
            .mul(BN_TEN.pow(siPower))
            .add(mod.mul(BN_TEN.pow(new BN(basePower + siUnitPower - modString.length))));
    }
    else {
        result = new BN(input.replace(/[^\d]/g, ''))
            .mul(BN_TEN.pow(siPower));
    }
    return [
        result,
        isValidNumber(result, bitLength, isZeroable, maxValue)
    ];
}
export function getValuesFromString(value, si, bitLength, isZeroable, maxValue) {
    const [valueBn, isValid] = inputToBn(value, si, bitLength, isZeroable, maxValue);
    return [
        value,
        valueBn,
        isValid
    ];
}

function getValuesFromBn(valueBn, si) {
    const value = si
        ? valueBn.div(BN_TEN.pow(new BN(formatBalance.getDefaults().decimals + si.power))).toString()
        : valueBn.toString();
    return [
        value,
        valueBn,
        true
    ];
}

export const findSi = v => formatBalance.findSi(v)

export default (string = '0') => getValuesFromString(string, formatBalance.findSi('-'), DEFAULT_BITLENGTH, true)

export { BN_ZERO }
