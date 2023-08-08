import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
import { LowerCasePipe } from './pipes/lower-case.pipe';
import { CamelCasePipe } from './pipes/camel-case.pipe';
import { CurrencyPipe } from '@angular/common';
import { NumberToPipePipe } from './pipes/number-to-pipe.pipe';

@NgModule({
  declarations: [
    AppComponent,
    CurrencyFormatPipe,
    LowerCasePipe,
    CamelCasePipe,
    NumberToPipePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [CurrencyPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }