import { createParamsIntegration, executeIntegrationProcedure, executeIntProcedure, getProductsChangeable } from "c/b2bUtil";

const ipNmSalesQuote = 'B2B_SalesQuote';

/** * Get Offers of Quote
 * @param {*} cartId Id Cart 
 * @param {*} offset
 * @param {*} pageSize
 * @returns Promise CartsSummary's JSON
 * */
const getOffersQuote = (idQuote, offset = '0', pageSize = '100') => {
    console.log('[b2bServiceCpq] - getOffersQuote ( cartId = ' + idQuote + ')');
    const input = {
        cartId: idQuote,
        offset: offset,
        pageSize: pageSize,
        eventName: 'consultaResumo'
    };

    return executeIntProcedure(createParamsIntegration(input, {}, ipNmSalesQuote));
};

/** * Get list of products of an Offer
 * @param {*} idQuote Id Quote
 * @param {*} idQuoteLineItem Id Quote Line Item
 * @returns Promise GetChildLineItems's JSON
 * */
const getChildProductsOffer = (idQuote, idQuoteLineItem, priceOffer = true, valid = true) => {
    console.log('[b2bServiceCpq] - getChildProductsOffer ( cartId = ' + idQuote + ', idQuoteLineItem = ' + idQuoteLineItem + ')');
    const input = {
        "cartId": idQuote,
        "idQuoteLineItem": idQuoteLineItem,
        "price": priceOffer,
        "valid": valid,
        "eventName": "getCartItemsById"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, ipNmSalesQuote));
}

/** * Update list of children of a Quote
 * @param {*} idQuote Id Quote
 * @param {*} lstProducts List Offers (List Quote Line Items)
 * @returns Promise UpdateCartItems's JSON
 * */
const updateCartItems = (idQuote, lstProducts) => {
    console.log('[b2bServiceCpq] - updateCartItems');
    const input = {
        "cartId": idQuote,
        "items": lstProducts,
        "eventName": "updateItem"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, ipNmSalesQuote));
}

/** * Update attributes of Cyber Product
 * @param {*} idQuote Id Quote
 * @param {*} lstAttributes List of Attributes from Internet's Product
 * @param {*} offerBundleCode Offer code 
 */
const updateAttributesCyber = (idQuote, lstAttributes, offerBundleCode) => {
    const input = {
        "cartId": idQuote,
        "items":  lstAttributes,
        "offerBundleCode": offerBundleCode,
        "eventName": "updateItem"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, ipNmSalesQuote));
}

/** * Update price list of children of a Quote
 * @param {*} idQuote Id Quote
 * @param {*} lstIdsQuoteLineItem List Offers Id (List Quote Line Items)
 * @returns Promise CalculatePriceCart's JSON
 * */
const calculatePriceCart = (idQuote, lstIdsQuoteLineItem) => {
    console.log('[b2bServiceCpq] - calculatePriceCart');
    const input = {
        "cartId": idQuote,
        "items": lstIdsQuoteLineItem,
        "eventName": "priceCart"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, ipNmSalesQuote));
}

/** * Delete a children of a Quote
 * @param {*} idQuote Id Quote
 * @param {*} idQuoteLineItem Id Service Account
 * @returns Promise DeleteCartItem's JSON
 * */
const deleteCartItem = (idQuote, idQuoteLineItem) => {
    console.log('[b2bServiceCpq] - deleteCartItem');
    const input = {
        "cartId": idQuote,
        "itemId": idQuoteLineItem,
        "eventName": "deleteItem"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, ipNmSalesQuote));
}

const setAttributesInternet = (cdProductCode, cdAttributeCategory, cdAttributeProduct, objProd, infoUserValues) => {
    if (objProd && objProd?.ProductCode === cdProductCode && objProd?.attributeCategories?.records?.length > 0) {
        for (let y = 0; y < objProd.attributeCategories.records.length; y++) {
            if (objProd.attributeCategories.records[y]?.Name === cdAttributeCategory && objProd.attributeCategories.records[y]?.productAttributes?.records?.length > 0) {
                for (let z = 0; z < objProd.attributeCategories.records[y].productAttributes.records.length; z++) {
                    if (objProd.attributeCategories.records[y].productAttributes.records[z]?.code === cdAttributeProduct) {
                        objProd.attributeCategories.records[y].productAttributes.records[z].userValues = infoUserValues;
                        return;
                    }
                }
            }
        }
    }
}

const setAttributesVozCorp = (cdAttribute, lstProducts, objAtt) => {
    for (let x = 0; x < lstProducts.length; x++) {
        if (lstProducts[x]?.attributeCategories?.records?.length > 0) {
            for (let y = 0; y < lstProducts[x].attributeCategories.records.length; y++) {
                if (lstProducts[x].attributeCategories.records[y]?.Name === 'Voz' && lstProducts[x].attributeCategories.records[y]?.productAttributes?.records?.length > 0) {
                    for (let z = 0; z < lstProducts[x].attributeCategories.records[y].productAttributes.records.length; z++) {
                        if (lstProducts[x].attributeCategories.records[y].productAttributes.records[z]?.code === cdAttribute) {
                            lstProducts[x].attributeCategories.records[y].productAttributes.records[z].userValues = objAtt;
                            return;
                        }
                    }
                }
            }
        }
    }
}

const setAttributesObject = (records, cdProduct, cdAttribute, objAtt) => {
    let lstRecords = getProductsChangeable(records, cdProduct);

    if (lstRecords[0]?.lineItems?.records && lstRecords[0]?.lineItems?.records.length > 0) {
        let lstProducts = lstRecords[0].lineItems.records;

        switch (cdAttribute) {
            case 'ATT_NUM_CONFIG':
                lstProducts = lstProducts.filter(prd => prd.ProductCode === 'PLANO_NUMERACAO');
                setAttributesVozCorp(cdAttribute, lstProducts, objAtt);
                break;
            case 'ATT_SUM_LIC':
                lstProducts = lstProducts.filter(prd => prd.ProductCode === 'FRANQUIA_NAC');
                setAttributesVozCorp(cdAttribute, lstProducts, objAtt);
                break;
            
            case 'ATT_PRAZO_ARMAZENAMENTO':
                lstProducts = lstProducts.filter(prd => prd.ProductCode === 'GRAVACAO');
                setAttributesVozCorp(cdAttribute, lstProducts, objAtt);
                break;
            default:
                break;
        }

        lstRecords[0].lineItems.records = lstProducts;
    }

    return lstRecords;
}

/** * Update attributes of Product
 * @param {*} idQuote Id Quote
 * @param {*} records JSON records CPQ
 * @param {*} cdProduct Product Code Father
 * @param {*} cdAttribute Product Code Child
 * @param {*} objAtt User Values to set Attribute
 */
const updateAttributes = (idQuote, records, cdProduct, cdAttribute, objAtt) => {
    let lstProducts = setAttributesObject(records, cdProduct, cdAttribute, objAtt);
    const input = {
        "cartId": idQuote,
        "items": { 'records': lstProducts },
        "eventName": "updateItem"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, ipNmSalesQuote));
}

/** * Update attributes of Internet Product
 * @param {*} idQuote Id Quote
 * @param {*} lstAttributes List of Attributes from Internet's Product
 */
const updateAttributesInternet = (idQuote, lstAttributes, isAsync = false) => {
    const input = {
        "cartId": idQuote,
        "items": { 'records': lstAttributes },
        "eventName": "updateItem"
    };

    const options = isAsync ? {"chainable": true, "queueableChainable": true} : {};

    return executeIntProcedure(createParamsIntegration(input, options, ipNmSalesQuote));
}

/** * Update attributes of Product
 * @param {*} idQuote Id Quote
 * @param {*} idQuoteLineItem Id Quote Line Item
 * @param {*} cdProduct Product Code Father
 * @param {*} cdAttribute Product Code Child
 * @param {*} objAtt User Values to set Attribute
 */
const updateAttributesObject = (idQuote, idQuoteLineItem, cdProduct, cdAttribute, objAtt) => {
    getChildProductsOffer(idQuote, idQuoteLineItem).then(resp => {
        if (resp?.result?.IPResult?.records?.length > 0) {
            updateAttributes(idQuote, resp.result.IPResult.records, cdProduct, cdAttribute, objAtt);
        }
    }).catch(error => {
        window.console.log(error, 'error');
    });
}

/** * Update Price's Net of Offer
 * @param {*} idQuote Id Quote
 * @param {*} idRootItem Id Quote Line Item
 * @returns Promise UpdatePriceNetOffer's JSON
 * */
const updatePriceNetOffer = (idQuote, idRootItem, vlDiscount) => {
    console.log('[b2bServiceCpq] - updatePriceNetOffer ( idQuote = ' + idQuote + ', idRootItem = ' + idRootItem + ')');
    vlDiscount = 0;

    const input = {
        ContextId: idQuote,
        idRootItem: idRootItem,
        appliedDiscount: vlDiscount,
        eventName: 'buscaQuoteLineItemById'
    };

    return executeIntProcedure(createParamsIntegration(input, {}, ipNmSalesQuote));
};

/** * Update Prices Net of Offers
 * @param {*} idQuote Id Quote
 * @returns Promise UpdatePriceOffer's JSON
 * */
const updatePricesNetOffers = (idQuote) => {
    console.log('[b2bServiceCpq] - updatePricesNetOffers ( idQuote = ' + idQuote + ')');
    const input = {
        ContextId: idQuote,
        eventName: 'buscaQuoteLineItem'
    };

    return executeIntProcedure(createParamsIntegration(input, {}, ipNmSalesQuote));
};

/** * Create a WorkingCart from QuoteId
 * @param {*} idQuote Id Quote
 * @returns Promise createWorkingCart's JSON
 * */
const createWorkingCart = (idQuote) => {
    console.log('[b2bServiceCPQ] - createWorkingCart');
    return new Promise((resolve, reject) => {
        const input = {
            "SalesQuoteId": idQuote
        }

        executeIntegrationProcedure(createParamsIntegration(input, {}, 'B2B_CreateWorkingCart'), resolve, reject);
    });
}

/** * Add product to Cart
 * @param {*} idQuote Id Quote
 * @param {*} itemId Offer pricebookId 
 * @returns Promise addProductToCart's JSON
 * */
const addProductToCart = (idQuote, itemId, billingAccount) => {
    console.log('[b2bServiceCPQ] - addProductToCart');
    return new Promise((resolve, reject) => {
        const input = {
            "QuoteId": idQuote,
            "itemId": itemId,
            "fieldsToUpdate": {
                "vlocity_cmt__BillingAccountId__c": billingAccount
            },
        }
        const options = {
            "chainable": true,
            "queueableChainable": true
        };

        executeIntegrationProcedure(createParamsIntegration(input, options, 'B2B_AddProductToCart'), resolve, reject);
    });
}

/** * Add product to Cart
 * @param {*} MemberIds QuoteId
 * @param {*} SalesQuoteId MembersIds of the location
 * @param {*} WorkingCartId MembersIds of the location
 * @returns Promise addToMemberBatchCall's JSON
 * */
const addToMemberBatchCall = (MemberIds, SalesQuoteId, WorkingCartId) => {
    console.log('[b2bServiceCPQ] - addToMemberBatchCall');
    return new Promise((resolve, reject) => {
        const input = {
            "BatchSize": 1,
            "QuoteGroupId": '[]',
            "MemberIds": MemberIds,
            "SalesQuoteId": SalesQuoteId,
            "WorkingCartId": WorkingCartId
        }

        executeIntegrationProcedure(createParamsIntegration(input, {}, 'B2B_AddToMemberBatchCall'), resolve, reject);
    });
}

/** * getUpdateAsyncJob
 * @param {*} SalesQuoteId SalesQuoteId of original quote
 * @param {*} eventName MembersIds of the location
 * @returns Promise addToMemberBatchCall's JSON
 * */
const getAsyncJobUpdate = (SalesQuoteId, eventName) => {
    console.log('[b2bServiceCPQ] - getAsyncJobUpdate');
    return new Promise((resolve, reject) => {
        const input = {
            "SalesQuoteId": SalesQuoteId,
            "eventName": eventName //async_Cart_commit
        }

        executeIntegrationProcedure(createParamsIntegration(input, {}, 'B2B_GetAsyncJobUpdate'), resolve, reject);
    });
}

/** * Get Item from Cart
 * @param {*} idQuote QuoteId
 * @returns Promise b2bGetCartItem's JSON
 * */
const b2bGetCartItems = (idQuote, price = false) => {
    console.log('[b2bServiceCPQ] - b2bGetCartItems');
    return new Promise((resolve, reject) => {
        const input = {
            "cartId": idQuote,
            "price": price
        };
        const options = {
            "chainable": true,
            "queueableChainable": true
        };

        executeIntegrationProcedure(createParamsIntegration(input, options, 'B2B_GetCartItems'), resolve, reject);
    });
}

const updateQuoteDefaultBillingAccount = (idQuote, billingAccount) => {
    console.log('[b2bServiceCPQ] - updateQuoteDefaultBillingAccount');
    return new Promise((resolve, reject) => {
        const input = {
            "quoteId": idQuote,
            "defaultBillingAccount" :billingAccount,
            "eventName":"updateBillingAccountQuote"
        }

        executeIntegrationProcedure(createParamsIntegration(input, {}, 'B2B_UpdateQuote'), resolve, reject);
    });
}

/** * Delete WorkingCart
 * @param {*} idQuote QuoteId
 * @returns Promise b2bDeleteCart's JSON
 * */
const b2bDeleteCart = (idQuote) => {
    console.log('[b2bServiceCPQ] - b2bDeleteCart');
    return new Promise((resolve, reject) => {
        const input = {
            "cartId": idQuote
        }

        executeIntegrationProcedure(createParamsIntegration(input, {}, 'B2B_DeleteCart'), resolve, reject);
    });
}

/** * Delete WorkingCart OpenGateway
 * @param {*} idQuote QuoteId
 * @param {*} RootItemIds list of srring with offers Ids to be deleted
 * @returns Promise b2bAsyncDeleteItemOpenGateway's JSON
 * */
const b2bAsyncDeleteItemOpenGateway = (idQuote, RootItemIds) => {
    console.log('[b2bServiceCPQ] - b2bAsyncDeleteItemOpenGateway');
    return new Promise((resolve, reject) => {
        const input = {
            "quoteId": idQuote,
            "RootItemIds": RootItemIds
        }

        executeIntegrationProcedure(createParamsIntegration(input, {}, 'B2B_BulkDeleteQuoteLineItems'), resolve, reject);
    });
}

/** * getESMAsyncJob
 * @param {*} AsyncProcessId MembersIds of the location
 * @returns Promise AsyncProcessId's JSON
 * */
const getESMAsyncJob = (AsyncProcessId) => {
    console.log('[b2bServiceCPQ] - getESMAsyncJob');
    return new Promise((resolve, reject) => {
        const input = {
            "asyncProcessId": AsyncProcessId
        }

        executeIntegrationProcedure(createParamsIntegration(input, {}, 'B2B_GetAsyncJobStatus'), resolve, reject);
    });
}

/** * Add product to Cart
 * @param {*} idQuote QuoteId
 * @param {*} itemId Offer pricebookId 
 * @returns Promise addToMemberBatchCall's JSON
 * */
const createAddCartItem = async (idQuote, itemId, billingAccount) => {
    console.log('[b2bServiceCPQ] - createAddCartItem');
    let WorkingCartId = "";
    let returnCreateAdd = "";
    let hasSuccess = false;

    await updateQuoteDefaultBillingAccount(idQuote, billingAccount).then(resp => {
        if(resp && resp.result && resp.result.IPResult && resp.result.IPResult.response && resp.result.IPResult.response.Quote_1){
            console.log('updateQuoteDefaultBillingAccount Sucesso => ', resp.result.IPResult.response.Quote_1[0]);
        }
    }).catch(error => { 
        window.console.log(error, 'error');
    });
    
    await createWorkingCart(idQuote).then(respW => {
        if (respW && respW.result && respW.result.IPResult && respW.result.IPResult.WorkingCartId && respW.result.IPResult.WorkingCartId !== '') {
            WorkingCartId = respW.result.IPResult.WorkingCartId
        }
    }).catch(error => {
        window.console.log(error, 'error');
    });

    if (WorkingCartId.length > 0) {
        await addProductToCart(WorkingCartId, itemId, billingAccount).then(resp => {
            if (resp && resp.result && resp.result.IPResult && resp.result.IPResult.response && resp.result.IPResult.response.messages &&
                resp.result.IPResult.response.messages[0].code && resp.result.IPResult.response.messages[0].code === '150') {
                hasSuccess = true
                returnCreateAdd = { WorkingCartId: WorkingCartId, idQuoteLine: [resp.result.IPResult.idQuoteLine], erroCart: false }
            }
        }).finally(() => {
            if (!hasSuccess) {
                returnCreateAdd = { WorkingCartId: WorkingCartId, erroCart: true, idQuoteLine: "" };
            }
        }).catch(error => {
            returnCreateAdd = { WorkingCartId: WorkingCartId, erroCart: true, idQuoteLine: "" };
            window.console.log(error, 'error');
        });

        //faz get cart item
        await b2bGetCartItems(WorkingCartId).then(resp => {
            if (hasSuccess) {
                returnCreateAdd = { ...returnCreateAdd, getCartItem: resp }
            }
        });
    }

    return returnCreateAdd;
}

/** * Get Alçada Information
 * @param {*} idQuote QuoteId
 * @param {*} idUser UserId 
 * @returns Promise getAlcadaInfo's JSON
 * */
const getAlcadaInfo = (idQuote, idUser) => {
    const input = {
        "quoteId": idQuote,
        "userId": idUser,
        "eventName": "consultaAlcada"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, ipNmSalesQuote));
}

const getRootId = (idOferta) => {
    console.log('[b2bServiceCPQ] - getRootId');
    return new Promise((resolve, reject) => {
        const input = {
            "id": idOferta,
            "eventName": "GetRootId"
        }

        executeIntegrationProcedure(createParamsIntegration(input, {}, ipNmSalesQuote), resolve, reject);
    });
}

/** * Update list of children of a Quote
 * @param {*} idQuote Id Quote
 * @param {*} pricebookId PricebookId
 * @param {*} velocidadePorta Velodiade Porta
 * @param {*} kit name Kit
 * @returns Promise UpdateCartItems's JSON
 * */
const updateQuoteLineRefEquipamento = (idQuote, velocidadePorta, kit, changeEquipament) => {
    const input = {
        "QuoteId": idQuote,
        "velocidadePorta": velocidadePorta,
        "kit": kit,
        "changeEquipament": changeEquipament
    };
    console.log('[b2bServiceCpq] - updateQuoteLineRefEquipamento', input);

    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_UpdateQuoteRefEquipamento'));
}

const consultaEnderecoTecnico = (obj) => {
    const input = {
        "endereco": obj,
        "eventName": "getTechnicalAddress"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_TechnicalAddress'));
};

const getQualification = (obj, isMigration = false) => {

    const input = {
        "tipoTecnologia"  : obj.tipoTecnologia,
        "lstInventario": obj.lstInventario,
        "idQuoteLine": obj.idQuoteLine,
        "velocidade_maxima": obj.velocidade_maxima,
        "tecnologia": obj.tecnologia,
        "quoteId": obj.quoteId,
        "fluxo": "Alta",
        "isMigration": isMigration,    
        "installationAddress": obj.installationAddress,
        "eventName": "GetQualification"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_Qualification'));
};

const getAddressTecnology = (obj) => {

    const input = {        
        "IdQuoteMember"  : obj.quoteMemberId,
        "eventName": "GetQuoteMemberTecnology"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_Qualification'));
};

const getQualificationCallback = (idQuoteLine) => {
    const input = {
        "quoteId": idQuoteLine,
        "eventName": "statusQuoteLineQualificacao"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_TechnicalAddress'));
};

const validateMessageCpq = (resp) => {
    let ret = false;

    if (resp?.result?.IPResult?.messages?.length > 0 && resp?.result?.IPResult?.messages[0]?.message && String(resp.result.IPResult.messages[0].message).includes('Success')) {
        ret = true;
    } else if (resp?.result?.IPResult?.response?.messages?.length > 0 && resp?.result?.IPResult?.response?.messages[0]?.message && String(resp?.result?.IPResult?.response?.messages[0]?.message).includes('Success')) {
        ret = true;
    }

    return ret;
};

const linkProductsCombo = (contextIdCombo, eventNameCombo, lineItemLinkage, hasDiscountCombo, quoteLineItemId) => {
    const input = {
        "contextId": contextIdCombo,
        "eventName": eventNameCombo,
        "lineItemLinkage": lineItemLinkage,
        "hasDiscountCombo": hasDiscountCombo,
        "quoteLineItemIdOferta": quoteLineItemId
    };

    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_LinkProducts'));
};

const UpdateQuotelineItens = (lstQuoteLineERB) => {
    const input = {
        "lstQuoteLineERB": lstQuoteLineERB,
        "eventName": "UpAttributesERB"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_SalesQuote'));
};

const getViabilityMetadata = (obj) => {
    const input = {
        "eventName": "consultaMetadado"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_TechnicalAddress'));
};

/**
 * Add the combo product to the cart
 * @param {*} comboProductId 
 * @param {*} idQuote 
 * @param {*} idQuoteMember 
 * @param {*} idServiceAccount 
 * @param {*} idBillingAccount 
 * @returns idQuoteLine
 */
const addComboProductToCart = (comboProductId, idQuote, idQuoteMember, idServiceAccount, idBillingAccount) => {
    const input = {
        "eventName": "AddChildProductToCart",
        "comboProductId": comboProductId,
        "quoteId": idQuote,
        "fieldsToUpdate": {
            "vlocity_cmt__QuoteMemberId__c": idQuoteMember,
            "vlocity_cmt__ServiceAccountId__c": idServiceAccount,
            "vlocity_cmt__BillingAccountId__c": idBillingAccount
        }
    }

    return executeIntProcedure(createParamsIntegration(input, {}, ipNmSalesQuote));
};

const getInfoOppBSIM = (oppId) => {
    const input = {
        "oppId"    : oppId,
        "eventName": "GetInfoBSIM"        
    };

    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_SalesQuote'));
};

const UpdateQuoteIncompatibiltyQualification = (quoteId,result) => {
    const input = {
            "quoteId":quoteId,
            "hasIncompatibiltyQualification":result,
            "eventName": "checkQualification"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_SalesQuote'));
};

/** * Verificar se tem oferta associada ao endereço
 * @param {*} idQuote Id Quote
 * @returns Lista de QuoteMember JSON
 * */
const checkHasProductCart = (idQuote) => {
    const input = {
        "quoteId": idQuote,
        "eventName": "hasProductCart"
    };
    
    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_SalesQuote'));
};
const upQuoteMember = (member, idQuote) => {
    const input = {
            "endereco" : member,
            "idQuote"  : idQuote,
            "eventName": "updateQuoteMember"        
    };
    
    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_SalesQuote'));
};

const updatePrazoDowngrade = (quoteLineItem,deadlineDowngrade) => {
    const input = {
        "quoteLineItem": quoteLineItem,
        "deadlineDowngrade":deadlineDowngrade,
        "eventName": "prazoDowngrade"
    };
    
    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_TechnicalAddress'));
};

const checkCreateRelationshipProducts = (quoteId) => {
    const input = {
        "contextId": quoteId,
        "eventName": "LinkProducts"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_LinkProducts'));
};

const createMemberGroupeEligibility = (memberId,lstMember) => {
    const input = {
        "memberId": memberId,
        "lstMember": lstMember,
        "eventName": "insertGroupeEligibility"
    };
    
    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_QuoteAddress'));
};

const getPicklistValues = () => {
    const input = {
        "eventName": "GetPicklistValues"
    };
    
    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_QuoteAddress'));
};

const quoteLineUpCodigoUnico = (lstQuoteLineIds) => {
    const input = {
        "lstQuoteLineIds": lstQuoteLineIds,
        "eventName": "QuoteLineUpCodigoUnico"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_SalesQuote'));
};

const pricingComboLine = (idQuote) => {
    const input = {
        "quoteId": idQuote,
        "eventName": "pricingComboLine"
    };

    return executeIntProcedure(createParamsIntegration(input, {}, 'B2B_SalesQuote'));
};

const getQLIs = async (idQuote) => {
    const input = {
        "quoteId": idQuote,
        "eventName": "getQLIs"
    };
    const resp = await executeIntProcedure(createParamsIntegration(input, {}, 'B2B_SalesQuote'));
    return resp;
};

const roundDiscountAmount = async (listQLIs, valorInformado) => {
    const input = {
        "listQLIs": listQLIs,
        "valorInformado": valorInformado,
        "eventName": "roundDiscountAmount"
    };
    const resp = await executeIntProcedure(createParamsIntegration(input, {}, 'B2B_SalesQuote'));
    return resp;
};

export {
    getOffersQuote,
    getChildProductsOffer,
    updateCartItems,
    calculatePriceCart,
    deleteCartItem,
    setAttributesInternet,
    updateAttributes,
    updateAttributesInternet,
    updateAttributesObject,
    updatePriceNetOffer,
    updatePricesNetOffers,
    createWorkingCart,
    updateQuoteDefaultBillingAccount,
    createAddCartItem,
    b2bGetCartItems,
    addProductToCart,
    addToMemberBatchCall,
    getAsyncJobUpdate,
    b2bDeleteCart,
    getESMAsyncJob,
    b2bAsyncDeleteItemOpenGateway,
    getAlcadaInfo,
    getRootId,
    updateQuoteLineRefEquipamento,
    consultaEnderecoTecnico,
    getQualification,
    getQualificationCallback,
    getAddressTecnology,
    validateMessageCpq,
    linkProductsCombo,
    UpdateQuotelineItens,
    getViabilityMetadata,
    addComboProductToCart,
    getInfoOppBSIM,
    checkHasProductCart,
    UpdateQuoteIncompatibiltyQualification,
    checkCreateRelationshipProducts,
    upQuoteMember,
    updatePrazoDowngrade,
    createMemberGroupeEligibility,
    getPicklistValues,
    quoteLineUpCodigoUnico,
    updateAttributesCyber,
    pricingComboLine,
    getQLIs,
    roundDiscountAmount
}