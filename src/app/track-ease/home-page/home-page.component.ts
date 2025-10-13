import { Component, OnInit, ViewChild, ElementRef, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service';
import Plotly from 'plotly.js-dist-min';
import { Observable, of } from 'rxjs';

// Enums for tab selections
export enum FirstTab {
    Sales = 'sales',
    Returns = 'returns',
}

export enum SecondTab {
    TotalSales = 'totalSales',
    Products = 'products',
}

// Types for chart data
type ChartType = 'bar' | 'pie';

interface ChartData {
    x?: string[];
    y?: number[];
    values?: number[];
    labels?: string[];
    type: ChartType;
    marker?: { color: string };
}

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css'],
    standalone: true,
    imports: [CommonModule, MatTabsModule, MatButtonModule, MatProgressSpinnerModule],
})
export class HomePageComponent implements OnInit {
    public static FirstTab = FirstTab;
    public static SecondTab = SecondTab;
    FirstTab = HomePageComponent.FirstTab;
    SecondTab = HomePageComponent.SecondTab;

    userId: number = 1;

    @ViewChild('graph') graph!: ElementRef;
    // @ViewChild('pieChart') pieChart!: ElementRef;

    private apiService = inject(BakeryManagementApiService);

    selectedFirstTab: FirstTab = FirstTab.Sales;
    selectedSecondTab: SecondTab = SecondTab.TotalSales;

    ngOnInit() {
        this.getUserIdFromLocalStorage().subscribe(userId => {
            if (userId) {
                this.apiService.getMonthlySales(userId).subscribe((data) => {
                    console.log('Monthly Sales:', data);
                    this.renderChart(data, 'Monthly Sales');
                });

                this.apiService.getMonthlyReturns(userId).subscribe((data) => {
                    console.log('Monthly Returns:', data);
                });
            } else {
                console.error('User ID not found in local storage.');
            }
        });
    }

    onFirstTabChange(tab: FirstTab) {
        this.selectedFirstTab = tab;
        this.loadFirstTabData();
    }

    onSecondTabChange(tab: SecondTab) {
        this.selectedSecondTab = tab;
        this.loadSecondTabData();
    }

    loadFirstTabData() {
        this.getUserIdFromLocalStorage().subscribe(userId => {
            if (this.selectedFirstTab === FirstTab.Sales) {
                this.apiService.getMonthlySales(userId).subscribe({
                    next: (data) => {
                        this.renderChart(data, 'Monthly Sales');
                    },
                    error: () => {
                        console.error('Error loading sales data');
                    }
                });
            } else {
                this.apiService.getMonthlyReturns(userId).subscribe({
                    next: (data) => {
                        this.renderChart(data, 'Monthly Returns');
                    },
                    error: () => {
                        console.error('Error loading returns data');
                    }
                });
            }
        });
    }

    loadSecondTabData() {
        if (this.selectedSecondTab === SecondTab.TotalSales) {
            this.apiService.getTotalSales().subscribe({
                next: (data) => {
                    this.renderPieChartWithData(data, 'Total Sales Distribution');
                },
                error: () => {
                    console.error('Error loading total sales data');
                }
            });
        } else {
            this.apiService.getProductsSalesInNumbers().subscribe({
                next: (data) => {
                    this.renderPieChartWithData(data, 'Products Distribution');
                },
                error: () => {
                    console.error('Error loading product sales data');
                }
            });
        }
    }

    private renderChart(data: any[], title: string) {
        if (!this.graph) return;
        
        const monthNames: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const dataMap = new Map<number, number>();
        data.forEach(d => {
            dataMap.set(d.month, parseFloat(d.quantity || d.monthly_spending || 0));
        });

        const xArray: string[] = monthNames;
        const yArray: number[] = [];

        for (let month = 1; month <= 12; month++) {
            yArray.push(dataMap.get(month) || 0);
        }

        const chartData: ChartData[] = [{
            x: xArray,
            y: yArray,
            type: 'bar',
            marker: { color: 'rgba(0, 123, 255, 0.8)' }
        }];

        // Force the plot to render with specific height and width
        const layout = { 
            title: { text: title },
            height: 400,
            width: this.graph.nativeElement.offsetWidth || 800,
            margin: { l: 50, r: 50, b: 50, t: 80 }
        };

        // Use responsive layout for better display
        const config = {
            responsive: true,
            displayModeBar: false // Hide the modebar
        };

        Plotly.newPlot(this.graph.nativeElement, chartData, layout, config);
    }

    
    private renderPieChartWithData(data: any[], title: string) {
        // if (!this.pieChart) return;
        
        // // Process the data to extract values and labels for the pie chart
        // // This is a sample implementation; adjust based on your actual data structure
        // const values: number[] = [];
        // const labels: string[] = [];
        
        // data.forEach(item => {
        //     if (item.name && item.value) {
        //         labels.push(item.name);
        //         values.push(Number(item.value));
        //     } else if (item.quarter && item.amount) {
        //         labels.push(`Q${item.quarter}`);
        //         values.push(Number(item.amount));
        //     } else if (item.product_name && item.total_sales) {
        //         labels.push(item.product_name);
        //         values.push(Number(item.total_sales));
        //     }
        // });
        
        // const pieData: ChartData[] = [{
        //     values: values.length ? values : [1],
        //     labels: labels.length ? labels : ['No Data'],
        //     type: 'pie'
        // }];
        
        // // Force the plot to render with specific height and width
        // const layout = { 
        //     title: { text: title },
        //     height: 400,
        //     width: this.pieChart.nativeElement.offsetWidth || 800
        // };
        
        // Plotly.newPlot(this.pieChart.nativeElement, pieData, layout);
    }

    private getUserIdFromLocalStorage(): Observable<number> {
        const user = localStorage.getItem('currentUser');
        return of(user ? JSON.parse(user).id : 0); // Default to 0 if user ID is not found
    }
}
