export class RecordRejected {
    dni: string;
    cuit: string;
    customerName: string;
    mail: string;
    observation: string;

    constructor(dni: string, cuit: string, customerName: string, mail: string, observation: string) {
        this.dni = dni;
        this.cuit = cuit;
        this.customerName = customerName;
        this.mail = mail;
        this.observation = observation;
    }
}