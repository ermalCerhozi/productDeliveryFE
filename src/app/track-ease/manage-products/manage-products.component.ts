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

import { Router, ActivatedRoute } from '@angular/router'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private bakeryManagementApiService = inject(BakeryManagementApiService);
  private dialog = inject(MatDialog);

  public tableColumns = signal([
    { key: "product_name", label: "manageProducts.product_name" },
    { key: "price", label: "manageProducts.price" },
    { key: "category", label: "manageProducts.category" },
  ]);
  public searchQuery = signal('');
  public searchOptions = signal<SearchOptions>({ title: true, all: false });
  public tableData$!: Observable<ProductEntity[]>;
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
      map(response => response.products)
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
    })
  }

  public onEdit(product: ProductEntity): void {
    this.dialog.open(CreateUpdateProductDialogComponent, {
        width: '100vh',
        maxHeight: '80%',
        data: { product }
    })
  }

  public onDelete(product: ProductEntity): void {
    this.dialog.open(ConfirmationDialogComponent, {
      width: '80%',
      maxHeight: '40%',
    })
  }

  public onPageInfoChange(pageInfo: { currentPage: number; pageSize: number }): void {
    this.currentPage.set(pageInfo.currentPage);
    this.pageSize.set(pageInfo.pageSize);
    this.findAll();
  }
}
