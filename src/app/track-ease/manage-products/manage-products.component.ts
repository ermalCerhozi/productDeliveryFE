import {
  Component,
  OnInit,
  inject,
  signal,
  DestroyRef,
} from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

import { MatDialog } from '@angular/material/dialog'
import { TranslocoService } from '@jsverse/transloco'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { MatSnackBar } from '@angular/material/snack-bar'

import { ProductEntity } from 'src/app/shared/models/product.model'
import { TableComponent } from 'src/app/shared/components/table/table.component'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import { TopBarComponent } from 'src/app/shared/components/top-bar/top-bar.component'
import { SearchOptions } from 'src/app/shared/models/context-navigation.model'
import { CreateUpdateProductDialogComponent } from 'src/app/shared/components/create-update-product-dialog/create-update-product-dialog.component'
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component'

@Component({
    selector: 'app-manage-products',
    templateUrl: './manage-products.component.html',
    styleUrls: ['./manage-products.component.scss'],
    imports: [
      AsyncPipe,
      TableComponent,
      TopBarComponent,
    ],
})
export class ManageProductsComponent implements OnInit {
  private translocoService = inject(TranslocoService)
  private destroyRef = inject(DestroyRef);
  private bakeryManagementApiService = inject(BakeryManagementApiService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  public tableColumns = signal([
    { key: "product_name", label: "manageProducts.product_name" },
    { key: "price", label: "manageProducts.price" },
  ]);
  public searchQuery = signal('');
  public searchOptions = signal<SearchOptions>({ title: true, all: false });
  public tableData$!: Observable<ProductEntity[]>;
  public totalCount = signal(0);
  public currentPage = signal(1);
  public pageSize = signal(10);

  ngOnInit(): void {
    this.findAll();
  }

  public findAll(): void {
    this.tableData$ = this.bakeryManagementApiService.searchProducts(
      this.searchQuery(),
      this.currentPage(),
      this.pageSize(),
      this.searchOptions()
    ).pipe(
      takeUntilDestroyed(this.destroyRef),
      map(response => {
        this.totalCount.set(response.count);
        return response.products;
      })
    );
  }

  public onSearch(query: string): void {
    this.searchQuery.set(query.toLowerCase());
    this.findAll();
  }

  public onOptionsChanged(options: SearchOptions): void {
    this.searchOptions.set(options);
    this.findAll();
  }

  public addProduct(): void {
    this.dialog.open(CreateUpdateProductDialogComponent, {
        width: '100vh',
        maxHeight: '80%',
    }).afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.findAll();
      });
  }

  public onEdit(product: ProductEntity): void {
    this.dialog.open(CreateUpdateProductDialogComponent, {
        width: '100vh',
        maxHeight: '80%',
        data: { product }
    }).afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.findAll();
      });
  }

  public onDelete(product: ProductEntity): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '80%',
      maxHeight: '40%',
      data: { 
        title: this.translocoService.translate('manageProducts.deleteTitle'),
        message: this.translocoService.translate('manageProducts.deleteMessage', { name: product.product_name }),
        displayOkButton: true,
        displayCancelButton: true
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.bakeryManagementApiService.deleteProduct(product.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.snackBar.open(
                this.translocoService.translate('manageProducts.deleteSuccess'),
                this.translocoService.translate('general.ok'),
                {
                  duration: 3000,
                  horizontalPosition: 'end',
                  verticalPosition: 'top',
                  panelClass: ['snack-bar-success'],
                }
              )
              this.findAll();
            },
            error: (error) => {
              const errorMessage = error?.error?.message || this.translocoService.translate('manageProducts.deleteError')
              this.snackBar.open(errorMessage, this.translocoService.translate('general.ok'), {
                duration: 5000,
                horizontalPosition: 'end',
                verticalPosition: 'top',
                panelClass: ['snack-bar-error'],
              })
            }
          });
      }
    });
  }

  public onPageInfoChange(pageInfo: { currentPage: number; pageSize: number }): void {
    this.currentPage.set(pageInfo.currentPage + 1);
    this.pageSize.set(pageInfo.pageSize);
    this.findAll();
  }
}
