public with sharing class ContaController {
    
    @AuraEnabled(cacheable=true)
    public static List<ContaWrapper> buscarContasComContatos() {
        List<Account> contas = [
            SELECT Id, Name,
                (SELECT Id, Name, Email, Phone FROM Contacts)
            FROM Account
            LIMIT 20
        ];

        List<ContaWrapper> resultado = new List<ContaWrapper>();

        for (Account acc : contas) {
            ContaWrapper wrapper = new ContaWrapper();
            wrapper.id = acc.Id;
            wrapper.nome = acc.Name;
            wrapper.contatos = new List<ContatoWrapper>();

            for (Contact c : acc.Contacts) {
                ContatoWrapper contato = new ContatoWrapper();
                contato.id = c.Id;
                contato.nome = c.Name;
                contato.email = c.Email;
                contato.telefone = c.Phone;
                wrapper.contatos.add(contato);
            }

            resultado.add(wrapper);
        }

        return resultado;
    }

    public class ContaWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String nome;
        @AuraEnabled public List<ContatoWrapper> contatos;
    }

    public class ContatoWrapper {
        @AuraEnabled public Id id;
        @AuraEnabled public String nome;
        @AuraEnabled public String email;
        @AuraEnabled public String telefone;
    }
}
