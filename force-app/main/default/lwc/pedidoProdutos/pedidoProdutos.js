import { LightningElement, api, wire, track } from 'lwc';
import buscarProdutosDoPedido from '@salesforce/apex/PedidoController.buscarProdutosDoPedido';

export default class PedidoProdutos extends LightningElement {
    @api recordId;
    @track produtos = [];
    erro;

    @wire(buscarProdutosDoPedido, { orderId: '$recordId' })
    carregarProdutos({ data, error }) {
        if (data) {
            this.produtos = data.map(prod => ({
                ...prod,
                expanded: false,
                iconName: 'utility:chevronright',
                alternativeText: 'Expand',
                title: 'Expand'
                    
            }));
            this.erro = undefined;
        } else if (error) {
            this.erro = error.body.message;
            this.produtos = undefined;
        }
    }

    toggleExpand(event) {
        const id = event.currentTarget.dataset.id;
        this.produtos = this.produtos.map(prod => {
            if (prod.id === id) {
                const isExpanded = !prod.expanded;
                return { 
                    ...prod, 
                    expanded: isExpanded,
                    alternativeText: isExpanded ? 'Collapse' : 'Expand',
                    title: isExpanded ? 'Collapse' : 'Expand',
                    iconName: isExpanded ? 'utility:chevrondown' : 'utility:chevronright'
                };
            }
            return prod;
        });
    }
}
