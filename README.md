# :zap: Product Delivery

* This app was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.9.
* This is a simple CRM app with standard pages for Users list, Product list, Orders list that are all paginated and aditional pages such as Profile, Home and Settings.
* To be upgraded to newer versions of Angular.

## :page_facing_up: Table of contents

* [:zap: Product Delivery](#zap-angular-form-validation)
  * [:books: General info](#books-general-info)
  * [:camera: Screenshots](#camera-screenshots)
  * [:signal_strength: Technologies](#signal_strength-technologies)
  * [:floppy_disk: Setup](#floppy_disk-setup)
  * [:computer: Code Examples](#computer-code-examples)
  <!-- * [:cool: Features](#cool-features) -->
  * [:clipboard: Status & To-Do List](#clipboard-status--to-do-list)
  * [:clap: Inspiration](#clap-inspiration)
  <!-- * [:file_folder: License](#file_folder-license) -->
  * [:envelope: Contact](#envelope-contact)

## :books: General info

* Helps businesses in placing orders, generating PDF lists of orders, monitoring deliveries, and tracking sales reports, all within a fully responsive web interface.

## :camera: Screenshots

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
    <img src="screenshots/login.png" alt="Login" width="200"/>
    <img src="screenshots/forgotPassword.png" alt="Forgot Password" width="200"/>
    <img src="screenshots/chart.png" alt="Chart" width="200"/>
    <img src="screenshots/profile.png" alt="Profile" width="200"/>
    <img src="screenshots/productList.png" alt="Products List" width="200"/>
    <img src="screenshots/filterOrders.png" alt="Filter Orders" width="200"/>
    <img src="screenshots/downloadedPDF.png" alt="Downloaded PDF" width="200"/>
    <img src="screenshots/createOrder.png" alt="Create Order" width="200"/>
    <img src="screenshots/clientList.png" alt="Client List" width="200"/>
</div>

## :signal_strength: Technologies

* [Angular v15](https://angular.io/)
* [Angular Material](https://v15.material.angular.io/)
* [PlotlyJS](https://plotly.com/javascript/)

## :floppy_disk: Setup

* Install dependencies using `yarn i`.
* Run `ng serve` for a dev server.
* Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## :computer: Code Examples

* Utilization of create-update component, emphasizing the ease of reusability through inputs and outputs.

```typescript
@ViewChild('createUpdateContainer')createUpdateContainer!: TemplateRef<CreateUpdateDialogComponent>

<ng-template #createUpdateContainer>
    <app-create-update-dialog
        [type]="'product'"
        [action]="actionState!"
        [product]="activeProduct!"
        (updateProduct)="updateProduct($event)"
        (createProduct)="createProduct($event)"
    ></app-create-update-dialog>
</ng-template>
```

<!-- ## :cool: Features

* All fields are required, the email field must be a valid email address and the password field must have a min length of 6.
* A custom validator and directive called MustMatch is used to validate that the confirm password and password fields match.
* The form validates on submit rather than as soon as each field is changed, this is implemented using the f.submitted property of the #f="ngForm" template variable which is true after the form is submitted for the first time. -->

## :clipboard: Status & To-Do List

* Status: Working.
* To-Do: Theming, translations, analytics.

<!-- ## :file_folder: License

* This project is licensed under the terms of the MIT license. -->

## :envelope: Contact

* Repo created by [Ermal Cerhozi](https://github.com/ermalCerhozi), email: ermal.cerhozi3@gmail.com