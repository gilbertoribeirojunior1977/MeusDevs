import { LightningElement, api, wire, track } from 'lwc';
import getUltimosPedidos from '@salesforce/apex/AccountResumoController.getUltimosPedidos';
import getAtividadesRecentes from '@salesforce/apex/AccountResumoController.getAtividadesRecentes';
import { getRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

const FIELDS = ['Account.Name', 'Account.Type', 'Account.SegmentacaoCliente__c', 'Account.LastModifiedDate'];

export default class AccountResumo extends NavigationMixin(LightningElement) {
    @api recordId;
    @track account;
    @track pedidos = [];
    @track atividades = [];
    error;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ data, error }) {
        if (data) {
            this.account = data.fields;
        } else if (error) {
            this.erro = error.body.message;
            this.account = undefined;
        }
    }

    @wire(getUltimosPedidos, { accountId: '$recordId' })
    wiredPedidos({ data, error }) {
        if (data) {
            this.pedidos = data;
        } else if (error) {
            this.erro = error.body.message;
            this.pedidos = undefined;
        }
    }

    @wire(getAtividadesRecentes, { accountId: '$recordId' })
    wiredAtividades({ data, error }) {
        if (data) {
            this.atividades = data;
        } else if (error) {
            this.erro = error.body.message;
            this.atividades = undefined;
        }
    }

    handlePedidoClick(event) {
        const pedidoId = event.currentTarget.dataset.id;

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: pedidoId,
                objectApiName: 'Order',
                actionName: 'view'
            }
        });
    }
}
