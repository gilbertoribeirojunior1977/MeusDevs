import { LightningElement, track } from 'lwc';
import createUser from '@salesforce/apex/CreateUserController.createUser';

export default class CreateUserApi extends LightningElement {
  @track nome = '';
  @track job = '';
  @track resposta = null;
  @track erro = null;
  @track carregando = false;

  handleNomeChange(event) {
    this.nome = event.target.value;
  }

  handleJobChange(event) {
    this.job = event.target.value;
  }

  async enviarDados() {
    this.resposta = null;
    this.erro = null;
    this.carregando = true;

    try {
      const result = await createUser({ nome: this.nome, job: this.job });
      const data = JSON.parse(result);

      this.resposta = {
        id: data.id,
        name: data.name,
        job: data.job,
        createdAt: new Date(data.createdAt).toLocaleString()
      };
    } catch (err) {
      this.erro = err.body?.message || err.message;
    } finally {
      this.carregando = false;
    }
  }
}