import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { OmniscriptActionCommonUtil } from "omnistudio/omniscriptActionUtils";

export function showToastUtil(title, typeVariant, typeMode, message) {
    typeMode = typeMode ? typeMode : 'dismissable';
    return new ShowToastEvent({ title: title, variant: typeVariant, mode: typeMode, message: message });
}

export function createParamsIntegration(obj, options, nmIntProcedure) {
    return {
        input: JSON.stringify(obj),
        sClassName: 'vlocity_cmt.IntegrationProcedureService',
        sMethodName: nmIntProcedure,
        options: JSON.stringify(options)
    };
}

export function executeIntProcedure(params) {
    return new Promise((resolve, reject) => {
        new OmniscriptActionCommonUtil().executeAction(params, null, this, null, null).then((resp) => {
            resolve(resp);
        }).catch((error) => {
            reject(error);
        });
    });
}

export function executeIntegrationProcedure(params, resolve, reject) {
    new OmniscriptActionCommonUtil().executeAction(params, null, this, null, null).then((resp) => {
        resolve(resp);
    }).catch((error) => {
        reject(error);
    });
}

export function getProductsChangeable(offer, codeProduct, snAddProducts = false) {
    let lstProducts = [];

    if (offer.length > 0 && offer[0]?.lineItems?.records?.length > 0) {
        offer[0].lineItems.records.forEach(product => {
            if (!snAddProducts) {
                if (product?.lineItems?.records?.length > 0) {
                    switch (codeProduct) {
                        case 'PABX_VIRTUAL':
                            if (product.ProductCode === codeProduct) {
                                lstProducts = product.lineItems.records;
                            }
                            break;
                        case 'VOZ_CORP_NAC':
                            if (product.ProductCode === codeProduct) {
                                lstProducts.push(product);
                            }
                            break;
                        default:
                            break;
                    }
                }
            } else {
                if (product?.childProducts?.records?.length > 0) {
                    switch (codeProduct) {
                        case 'PABX_VIRTUAL':
                            if (product.ProductCode === codeProduct) {
                                const keywords = ["LICENCA_", "INTEGRACAO_VOZ", "GRAVACAO"];
                                lstProducts = product.childProducts.records.filter(item => keywords.some(keyword => item?.ProductCode?.value?.includes(keyword)));
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        });
    }

    return lstProducts;
}

export function getOptionsPickList() {
    const input = {
        eventName: 'consultaListaValores'
    };

    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_ManageAccountData'));
}

export function validateNumber(value) {
    return (value && !isNaN(value)) ? value : (value && value > 0) ? value : 0;
}

export function sortList(lstObjects, fieldName) {
    lstObjects.sort(function (objA, objB) {
        if (objA[fieldName] < objB[fieldName]) { return -1; }
        if (objA[fieldName] > objB[fieldName]) { return 1; }
        return 0;
    });

    return lstObjects;
}

export function maskCep(infoCep) {
    if (infoCep) {
        infoCep = infoCep.replace(/\D/g, '');
        infoCep = infoCep.replace(/(\d{5})(\d)/, '$1-$2');
    } else {
        infoCep = 'N/A';
    }

    return infoCep
}

export function removeKeyObject(obj, key) {
    if (obj && key && obj[key]) {
        delete obj[key];
    }

    return obj;
}

export function convertToBrDate(dtObj) {
    if (dtObj) {
        dtObj = String(dtObj).substring(0, 10);
        const arrayDate = dtObj.split('-');
        dtObj = arrayDate[2] + '/' + arrayDate[1] + '/' + arrayDate[0];
    }

    return dtObj;
}

export function createParentRecords(obj) {
    let parentRecords = { records: [] };

    if (obj) {
        obj = removeKeyObject(obj, 'childProducts');
        obj = removeKeyObject(obj, 'productGroups');
        obj = removeKeyObject(obj, 'lineItems');
        parentRecords.records.push(obj);
    }

    return parentRecords;
}

export function createParentRecordsFilter(obj) {
    let parentRecords = { records: [] };

    if (obj) {
        let item = {
            "Id": obj.productId,
            "productHierarchyPath": obj.productHierarchyPath,
            "productId": obj.productId,
            "itemType": obj.itemType,
            "parentLineItemId": obj.Id.value
        };

        parentRecords.records.push(item);
    }

    return parentRecords;
}

export function createCurrencyValue(tpLanguage, tpCurrency, value) {
    return new Intl.NumberFormat(tpLanguage, { style: 'currency', currency: tpCurrency }).format(Math.abs(validateNumber(value)));
}