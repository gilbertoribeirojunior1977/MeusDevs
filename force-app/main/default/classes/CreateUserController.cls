public with sharing class CreateUserController {
    @AuraEnabled(cacheable=false)
    public static String createUser(String nome, String job) {
        Http http = new Http();
        HttpRequest request = new HttpRequest();

        request.setEndpoint('callout:ReqResAPI/api/users');
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');

        Map<String, String> bodyMap = new Map<String, String>{
            'name' => nome,
            'job' => job
        };

        request.setBody(JSON.serialize(bodyMap));

        try {
            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 201) {
                return response.getBody();
            } else {
                throw new CalloutException('Erro: ' + response.getStatus());
            }

        } catch (Exception e) {
            throw new AuraHandledException('Erro na chamada HTTP: ' + e.getMessage());
        }
    }
}