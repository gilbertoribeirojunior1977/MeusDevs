public with sharing class AccountResumoController {

    @AuraEnabled(cacheable=true)
    public static List<Order> getUltimosPedidos(Id accountId) {
        return [
            SELECT Id, OrderNumber, Status, EffectiveDate, TotalAmount
            FROM Order
            WHERE AccountId = :accountId
            ORDER BY EffectiveDate DESC
            LIMIT 5
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<AtividadeWrapper> getAtividadesRecentes(Id accountId) {
        List<AtividadeWrapper> atividades = new List<AtividadeWrapper>();

        for (Task t : [
            SELECT Id, Subject, ActivityDate, Status
            FROM Task
            WHERE AccountId = :accountId
            ORDER BY ActivityDate DESC
            LIMIT 5
        ]) {
            atividades.add(new AtividadeWrapper(t.Id, t.Subject, t.ActivityDate, 'Tarefa', t.Status));
        }

        for (Event e : [
            SELECT Id, Subject, ActivityDate, BI_BR_Status__c
            FROM Event
            WHERE AccountId = :accountId
            ORDER BY ActivityDate DESC
            LIMIT 5
        ]) {
            String status = e.BI_BR_Status__c;
            atividades.add(new AtividadeWrapper(e.Id, e.Subject, e.ActivityDate, 'Evento', status));
        }

        atividades.sort(new DataAtividadeComparator());

        if (atividades.size() > 5) {
            List<AtividadeWrapper> top5 = new List<AtividadeWrapper>();
            for (Integer i = 0; i < 5; i++) {
                top5.add(atividades[i]);
            }
            return top5;
        }
        return atividades;
    }

    public class AtividadeWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String assunto;
        @AuraEnabled public Date dataAtividade;
        @AuraEnabled public String tipo;
        @AuraEnabled public String status;

        public AtividadeWrapper(Id id, String assunto, Date dataAtividade, String tipo, String status) {
            this.id = id;
            this.assunto = assunto;
            this.dataAtividade = dataAtividade;
            this.tipo = tipo;
            this.status = status;
        }
    }

    public class DataAtividadeComparator implements Comparator<AtividadeWrapper> {
        public Integer compare(AtividadeWrapper a, AtividadeWrapper b) {
            if (a.dataAtividade == null && b.dataAtividade == null) return 0;
            if (a.dataAtividade == null) return 1;
            if (b.dataAtividade == null) return -1;
            
            if (b.dataAtividade > a.dataAtividade) return 1;
            if (b.dataAtividade < a.dataAtividade) return -1;
            return 0;
        }
    }
}
