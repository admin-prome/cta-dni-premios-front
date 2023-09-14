import { Component, OnInit } from '@angular/core';
import { Client } from './models/client.model';
import { ClientService } from './services/client.service';
import { MailService } from './services/mail.service';
import { patchDTO } from './models/patchDto.model';
import { RecordPatch } from './models/recordPatch.model';
import { RecordRejected } from './models/recordRejected.model';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { AlertService } from './services/alert.service';
import { BlobService } from './services/blob.service';
import { RecordAwarded } from './models/recordAwarded.model';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Cuenta DNI Premios';

  clients: Client[] = [];

  recordsToBePatched: RecordPatch[] = [];
  recordsToBeRejected: RecordRejected[] = [];
  recordsToBeAwarded: RecordAwarded[] = [];

  segmentAnalysisCompleted: boolean = false;

  //Filters 
  selectedSegmentAnalysis: string = '';
  filteredClients: Client[] = [];

  //Spinner
  spinner: boolean = false;

  //Modals
  selectedClient: Client | null = null;
  showModal: boolean = false;
  modalType!: string;
  segmentObservation: string = '';
  financeObservation: string = '';
  imageModal: string = '';
  transferAmount = '0';

  //CharactersAllowed
  maxCharacterCount: number = 1000;
  characterCount: number = 0;

  //Save
  isSaving: boolean = false;
  buttonText: string = 'Guardar y enviar';


  constructor(public clientService: ClientService, public mailService: MailService, public alertService: AlertService, public blobService: BlobService) {

    this.selectedClient = new Client(0, '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'Pendiente', '', '', '', '5000', '', '', '', '');
    this.filteredClients = this.clients;
  }

  ngOnInit() {
    this.loadData();
  }

  parseToNumber(value: string | undefined): number {
    return value !== undefined ? parseFloat(value) : 0;
  }

  //ActionManagment
  isButtonDisabled(client: Client, action: string): boolean {
    if (action === 'accept') {
      return client.segmentAnalysis === 'Aprobado' || client.segmentAnalysis === 'Rechazado';
    } else if (action === 'reject') {
      return client.segmentAnalysis === 'Rechazado' || client.segmentAnalysis === 'Aprobado';
    }
    return false;
  }

  isFinanceActionDisabled(client: Client, action: string): boolean {
    if (client.segmentAnalysis === 'Pendiente' || client.segmentAnalysis === 'Rechazado') {
      return true;
    } else if (action === 'accept') {
      return client.financeAnalysis === 'Aprobado' || client.financeAnalysis === 'Rechazado';
    } else if (action === 'reject') {
      return client.financeAnalysis === 'Aprobado' || client.financeAnalysis === 'Rechazado';
    }
    return false;
  }


  handleAnalysis(client: Client, type: string) {

    switch (type) {
      case "segmentAnalysisApproved":
        client.segmentAnalysis = 'Aprobado';
        const patchDTORecordSegmentAnalysisApproved = new patchDTO('/SegmentAnalysis', client.segmentAnalysis)
        const recordToBePatchedSegmentAnalysisApproved = new RecordPatch(client.dni, client.cuit, [patchDTORecordSegmentAnalysisApproved], client.firstName + ' ' + client.lastName, client.email)
        this.recordsToBePatched.push(recordToBePatchedSegmentAnalysisApproved);
        this.segmentAnalysisCompleted = true;
        break;

      case "financeAnalysisApproved":
        client.financeAnalysis = 'Aprobado';
        this.closeModal();
        const patchDTORecordFinanceAnalysisApproved = new patchDTO('/FinanceAnalysis', client.financeAnalysis);
        const patchDTORecordPaymentMade = new patchDTO('/paymentMade', 'Si');
        const recordToBePatchedFinanceAnalysisApproved = new RecordPatch(client.dni, client.cuit, [patchDTORecordFinanceAnalysisApproved, patchDTORecordPaymentMade], client.firstName + ' ' + client.lastName, client.email);
        this.recordsToBePatched.push(recordToBePatchedFinanceAnalysisApproved);

        const recordToBeAwarded = new RecordAwarded(client.dni, client.cuit, client.firstName + ' ' + client.lastName, client.email)
        this.recordsToBeAwarded.push(recordToBeAwarded);
        break;
    }
  }

  observeClient(selectedClient: Client | null, type: string) {

    if (selectedClient) {

      switch (type) {
        case "RejectSegment":
          selectedClient.segmentAnalysis = 'Rechazado';
          const recordToBeRejected = new RecordRejected(selectedClient.dni, selectedClient.cuit, selectedClient.firstName + ' ' + selectedClient.lastName, selectedClient.email, selectedClient.segmentObservation);
          this.recordsToBeRejected.push(recordToBeRejected);
          break;
        case "RejectFinance":
          const patchDTORecordFinanceObservationRejected = new patchDTO('/Observation', selectedClient.segmentObservation);
          // const patchDTOObservationSegmento = new patchDTO('/SegmentAnalysis', 'Observado');
          // const recordToBePatchedFinanceObservationRejected  = new RecordPatch(selectedClient.dni, selectedClient.cuit, [patchDTORecordFinanceObservationRejected, patchDTOObservationSegmento], selectedClient.fullName, selectedClient.email);
          const recordToBePatchedFinanceObservationRejected = new RecordPatch(selectedClient.dni, selectedClient.cuit, [patchDTORecordFinanceObservationRejected], selectedClient.firstName + ' ' + selectedClient.lastName, selectedClient.email);
          this.recordsToBePatched.push(recordToBePatchedFinanceObservationRejected);
          break;
      }

      this.filterClientsBySegmentAnalysis();
    }
    this.closeModal();
  }

  setTransferAmount(selectedClient: Client | null, value: string) {
    if (selectedClient) {
      selectedClient.transferAmount = value;
      const patchDTORecordTransferAmount = new patchDTO('/transferAmount', selectedClient.transferAmount)
        const recordToBePatchedTransferAmount = new RecordPatch(selectedClient.dni, selectedClient.cuit, [patchDTORecordTransferAmount], selectedClient.firstName + ' ' + selectedClient.lastName, selectedClient.email)
        this.recordsToBePatched.push(recordToBePatchedTransferAmount);
    }
    this.closeModal();
  }

  updateAnalysis(client: Client, segmentAnalysisNumber: number, json: string) {
    this.clientService.handleAction(json).subscribe(
      (response) => {
        this.handleMailSending(client, segmentAnalysisNumber)
      },
      (error) => {
        console.error("Error en updateAnalysis:", error);
        this.alertService.alert("error", "Ocurrió un problema al actualizar los datos. Por favor, intentá nuevamente más tarde");
      }
    );
  }

  handleMailSending(client: Client, segmentAnalysisNumber: number) {
    try {
      let mailJson = {
        properties: {
          Customer: client.firstName + client.lastName,
          Email: client.email,
          Resolution: segmentAnalysisNumber,
          Observation: '',
        }
      };

      this.mailService.sendEmail(JSON.stringify(mailJson)).subscribe(
        (response) => {

        },
        (error) => {
          console.error(error);
        }
      );
    } catch (error) {
      console.error("Error en handleMailSending:", error);
      this.alertService.alert("error", "Ocurrió un problema al enviar el correo electrónico. Por favor, intentá nuevamente más tarde");
    }
  }



  //Filters
  filterClientsBySegmentAnalysis() {
    if (this.selectedSegmentAnalysis) {
      this.filteredClients = this.clients.filter(client => client.segmentAnalysis === this.selectedSegmentAnalysis);
    } else {
      this.filteredClients = this.clients;
    }
  }

  //Modals
  openModal(type: string, client?: Client, imageUrl?: string): void {
    this.selectedClient = client || null;
    console.log(this.selectedClient);
    this.imageModal = imageUrl ? imageUrl : '';
    this.showModal = true;
    this.modalType = type;

    switch (type) {
      case "RejectSegment":
        this.segmentObservation = client?.segmentObservation || '';
        this.updateCharacterCount(this.segmentObservation);
        break;
      case "RejectFinance":
        this.financeObservation = client?.financeObservation || '';
        this.updateCharacterCount(this.financeObservation);
        break;
    }
  }

  closeModal(): void {
    this.showModal = false;
  }

  updateCharacterCount(observation: string): void {
    this.characterCount = observation.length;
  }

  onFileSelected(event: any, client: Client): void {
    const file = event.target.files[0];
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop();
    const newFileName = `comprobante_pago_${client.lastName}_${client.dni}.${fileExtension}`;
    const renamedFile = new File([file], newFileName, { type: file.type });
    const reader = new FileReader();


    reader.onloadend = () => {
      client.paymentReceiptImage = newFileName;
    };

    if (renamedFile) {
      reader.readAsDataURL(renamedFile);
    }

    this.managePaymentReceiptImage(renamedFile, client);
  }

  managePaymentReceiptImage(file: File, client: Client) {

    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    this.blobService.postFile(formData)
      .subscribe(
        (response) => {

          let url = response.result
          const patchDTOImageReceipt = new patchDTO('/paymentReceiptImage', url);
          const patchDTOFinanceAnalysis = new patchDTO('/financeAnalysis', 'Aprobado');
          const patchDTOPaymentMade = new patchDTO('/paymentMade', 'Si');
          const recordToAddImageReceipt = new RecordPatch(client.dni, client.cuit, [patchDTOImageReceipt, patchDTOFinanceAnalysis, patchDTOPaymentMade], client.firstName + ' ' + client.lastName, client.email);
          this.recordsToBePatched.push(recordToAddImageReceipt);
          this.alertService.alert("success", "Imagen correctamente cargada");
        },
        (error) => {
          console.error('Error uploading file:', error);
          this.alertService.alert("error", "Ocurrió un problema al guardar la imagen. Por favor, intentá nuevamente más tarde");
        }
      );
  }



  //Save
  async saveChanges() {

    try {
      this.manageChanges()

    } catch (error) {
      console.error("Error en saveChanges:", error);
      this.alertService.alert("error", "Ocurrió un problema al guardar los cambios. Por favor, intentá nuevamente más tarde");
    }
  }

  async manageChanges() {

    await this.clientService.patchRecords(this.recordsToBePatched);
    await this.clientService.rejectRecords(this.recordsToBeRejected);

    await this.mailService.sendMailsPatch(this.recordsToBePatched);
    await this.mailService.sendMailsReject(this.recordsToBeRejected);
    await this.mailService.sendMailsAwarded(this.recordsToBeAwarded);

    this.isSaving = true;
    this.buttonText = 'Guardando...';
    this.recordsToBePatched = [];
    setTimeout(() => {
      this.isSaving = false;
      this.buttonText = 'Guardar y enviar';
      this.loadData();
    }, 3000);
  }

  loadData() {
    try {
      this.spinner = true;
      this.clientService.getClients().subscribe(
        (response) => {
          this.clients = response.result;
          this.filteredClients = this.clients;
          this.spinner = false;
          console.log(response.result);
        },
        (error) => {
          console.error("Error en loadData:", error);
          this.alertService.alert("error", "Ocurrió un problema al cargar los datos. Por favor, intentá nuevamente más tarde.");
          this.spinner = false;
        }
      );
    } catch (error) {
      console.error("Error en loadData:", error);
      this.alertService.alert("error", "Ocurrió un problema al cargar los datos. Por favor, intentá nuevamente más tarde.");
      this.spinner = false;
    }
  }

  areSegmentsComplete(): boolean {
    return this.filteredClients.every(
      (c) => c.segmentAnalysis === 'Approved' || c.segmentAnalysis === 'Rejected'
    );
  }

  exportToExcel() {
    const currentDate = new Date();

    const clientsData = [
      ['Hace la cuenta - Datos descargados el día: ' + currentDate.toLocaleString()],
      ['Nombre', 'Apellido', 'DNI', 'Correo electrónico', 'Tipo de teléfono', 'Código de área',
        'Número de teléfono', 'Período de la promoción', 'Fecha de liquidación préstamo',
        'Monto de ventas por Cuenta DNI Comercios', 'CUIT', 'Link del adjunto', 'CBU',
        'Crédito BIP', 'Análisis de Segmentos', 'Observación de Segmentos', 'Análisis de Finanzas', 'Observación de Finanzas', '¿Pago realizado?', 'Importe a transferir'],

      ...this.clients.map(client => [client.firstName, client.lastName, client.dni, client.email,
      client.phoneType, client.areaCode, client.phoneNumber, client.salesPeriod, client.loanSettlementDate,
      client.salesAmountCtaDNICom, client.cuit, client.attachmentLink, client.cbu, client.BIPCredit,
      client.segmentAnalysis, client.segmentObservation, client.financeAnalysis, client.financeObservation, client.paymentMade, client.transferAmount]),
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(clientsData);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const formattedDate = `${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`;
    const formattedTime = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
    const fileName = `Hace la cuenta - ${formattedDate}-${formattedTime}.xlsx`;
    const excelFile = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(excelFile, fileName);
  }
}