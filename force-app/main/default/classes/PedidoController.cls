public with sharing class PedidoController {
    @AuraEnabled(cacheable=true)
    public static List<ProdutoWrapper> buscarProdutosDoPedido(Id orderId) {
        List<OrderItem> itens = [
            SELECT Id, 
                   Quantity, 
                   Product2.Name,
                   vlocity_cmt__RecurringTotal__c, 
                   vlocity_cmt__MainOrderItemId__c
            FROM OrderItem
            WHERE OrderId = :orderId
        ];

        System.debug(itens);
        Map<Id, ProdutoWrapper> produtosMap = new Map<Id, ProdutoWrapper>();
        List<ProdutoWrapper> produtosFinais = new List<ProdutoWrapper>();

        for (OrderItem item : itens) {

            ProdutoWrapper wrapper = new ProdutoWrapper();
            wrapper.id = item.Id;
            wrapper.nome = item.Product2.Name;
            wrapper.quantidade = item.Quantity;
            wrapper.preco = item.vlocity_cmt__RecurringTotal__c;
            wrapper.componentes = new List<ProdutoWrapper>();

            Id parentId = item.vlocity_cmt__MainOrderItemId__c;
            if (parentId != null) {
                ProdutoWrapper pai;
                if (produtosMap.containsKey(parentId)) {
                    pai = produtosMap.get(parentId);
                    pai.componentes.add(wrapper);
                } else {
                    pai = new ProdutoWrapper();
                    pai.id = parentId;
                    pai.nome = item.Product2.Name;
                    pai.componentes = new List<ProdutoWrapper>();
                    produtosMap.put(item.Id, pai);
                    produtosFinais.add(pai);
                }
            } else {
                System.debug('Criou o Pai');
                produtosMap.put(item.Id, wrapper);
                produtosFinais.add(wrapper);
            }
        }

        System.debug('Produtos Finais:' + produtosFinais);
        return produtosFinais;
    }

    public class ProdutoWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String nome;
        @AuraEnabled public Decimal quantidade;
        @AuraEnabled public Decimal preco;
        @AuraEnabled public List<ProdutoWrapper> componentes;
    }
}
