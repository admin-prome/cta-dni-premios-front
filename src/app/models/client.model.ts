import { last } from "rxjs";

export class Client {
    id: number;
    trackingNumber: string;
    firstName: string;
    lastName: string;
    dni: string;
    email: string;
    emailConfirmation: string;
    phoneType: string;
    areaCode: string;
    phoneNumber: string;
    salesPeriod: string;
    loanSettlementDate: string;
    salesAmountCtaDNICom: string;
    cuit: string;
    attachmentLink: string;
    CBU: string;
    BIPCredit: string;
    segmentAnalysis: string;
    financeAnalysis: string;
    segmentObservation: string;
    financeObservation: string;
    paymentMade: string;
    transferAmount: string;
    paymentReceiptImage: string;
    paymentObservation: string;
    comercialExecutive: string;
    comercialExecutiveBranch: string;


    constructor(
        id: number,
        trackingNumber: string,
        firstName: string,
        lastName: string,
        dni: string,
        email: string,
        emailConfirmation: string,
        phoneType: string,
        areaCode: string,
        phoneNumber: string,
        salesPeriod: string,
        loanSettlementDate: string,
        salesAmountCtaDNICom: string,
        cuit: string,
        attachmentLink: string,
        CBU: string,
        BIPCredit: string,
        segmentAnalysis: string,
        financeAnalysis: string,
        segmentObservation: string,
        financeObservation: string,
        paymentMade: string,
        transferAmount: string,
        paymentReceiptImage: string,
        paymentObservation: string,
        comercialExecutive: string,
        comercialExecutiveBranch: string
    ) {

        this.id = id;
        this.trackingNumber = trackingNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dni = dni;
        this.email = email;
        this.emailConfirmation = emailConfirmation;
        this.phoneType = phoneType;
        this.areaCode = areaCode;
        this.phoneNumber = phoneNumber;
        this.salesPeriod = salesPeriod;
        this.loanSettlementDate = loanSettlementDate;
        this.salesAmountCtaDNICom = salesAmountCtaDNICom;
        this.cuit = cuit;
        this.attachmentLink = attachmentLink;
        this.CBU = CBU;
        this.BIPCredit = BIPCredit;
        this.segmentAnalysis = segmentAnalysis;
        this.financeAnalysis = financeAnalysis;
        this.segmentObservation = segmentObservation;
        this.financeObservation = financeObservation;
        this.paymentMade = paymentMade;
        this.transferAmount = '0';
        this.paymentReceiptImage = paymentReceiptImage;
        this.paymentObservation = paymentObservation;
        this.comercialExecutive = comercialExecutive;
        this.comercialExecutiveBranch = comercialExecutiveBranch;
    }

    getFullName() {
        return this.firstName + ' ' + this.lastName;
    }
}