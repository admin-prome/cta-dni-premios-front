export class RecordAwarded {

    dni: string;
    cuit: string;
    customerName: string;
    mail: string;

    constructor(dni: string, cuit: string, customerName: string, mail: string) {
        this.dni = dni;
        this.cuit = cuit;
        this.customerName = customerName;
        this.mail = mail;
    }
}