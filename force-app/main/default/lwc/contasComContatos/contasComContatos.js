import { LightningElement, track } from 'lwc';
import buscarContasComContatos from '@salesforce/apex/ContaController.buscarContasComContatos';

export default class ContasComContatos extends LightningElement {
    @track contas = [];
    erro;

    connectedCallback() {
        this.carregarContas();
    }

    carregarContas() {
        buscarContasComContatos()
            .then(data => {
                this.contas = data.map(conta => ({
                    ...conta,
                    expanded: false,
                    iconName: 'utility:chevronright'
                }));
                this.erro = undefined;
            })
            .catch(error => {
                this.erro = error;
                this.contas = [];
            });
    }

    toggleExpand(event) {
        const id = event.currentTarget.dataset.id;
        this.contas = this.contas.map(conta => {
            if (conta.id === id) {
                const expanded = !conta.expanded;
                return {
                    ...conta,
                    expanded,
                    iconName: expanded ? 'utility:chevrondown' : 'utility:chevronright'
                };
            }
            return conta;
        });
    }
}
