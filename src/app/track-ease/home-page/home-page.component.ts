import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { BakeryManagementApiService } from 'src/app/services/bakery-management-api.service'
import Plotly from 'plotly.js-dist-min'

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css'],
    standalone: true,
    imports: [CommonModule],
})
export class HomePageComponent implements OnInit {
    @ViewChild('chartDiv') chartDiv!: ElementRef

    private apiService = inject(BakeryManagementApiService)

    isLoading = true
    errorMessage = ''

    ngOnInit() {
        this.loadAdminMonthlySales()
    }

    loadAdminMonthlySales() {
        this.apiService.getAdminMonthlySales().subscribe({
            next: (data) => {
                this.renderChart(data, 'Monthly Sales')
                this.isLoading = false
            },
            error: (error) => {
                this.errorMessage = 'Failed to load sales data'
                this.isLoading = false
                console.error('Error loading sales:', error)
            }
        })
    }

    private renderChart(data: any[], title: string) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        const dataMap = new Map()
        data.forEach(d => {
            dataMap.set(d.month, parseFloat(d.monthly_sales || d.monthly_spending || 0))
        })
        
        const xArray = monthNames
        const yArray = []
        
        for (let month = 1; month <= 12; month++) {
            yArray.push(dataMap.get(month) || 0)
        }

        const chartData = [{
            x: xArray,
            y: yArray,
            type: 'bar' as const,
            marker: { color: 'rgba(0, 123, 255, 0.8)' }
        }]

        const layout: any = { title: title }

        Plotly.newPlot(this.chartDiv.nativeElement, chartData, layout)
    }
}
