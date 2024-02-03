import { Component, OnInit } from '@angular/core'

@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent implements OnInit {
    ngOnInit() {
        console.log('OrdersComponent')
    }

    donutChart = {
        data: [
            {
                values: [19, 26, 55],
                labels: ['Other', 'Fruits', 'Drinks'],
                type: 'pie',
                hole: 0.3,
            },
        ],
        layout: {
            autosize: true, // makes the chart responsive
            title: 'Products Sales 2023',
        },
        showlegend: true,
        legend: {
            x: 1,
            y: 1,
        },
        grid: { rows: 1, columns: 2 },
    }

    barChart = {
        data: [
            {
                x: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                ],
                y: [20, 14, 25, 16, 18, 22, 19, 15, 12, 16, 14, 17],
                type: 'bar',
                name: 'Sales',
                marker: {
                    color: 'rgb(49,130,189)',
                    opacity: 0.7,
                },
            },
            {
                x: [
                    'Jan',
                    'Feb',
                    'Mar',
                    'Apr',
                    'May',
                    'Jun',
                    'Jul',
                    'Aug',
                    'Sep',
                    'Oct',
                    'Nov',
                    'Dec',
                ],
                y: [2, 8, 4, 3, 6, 9, 5, 4, 0, 2, 2, 6],
                type: 'bar',
                name: 'Returns',
                marker: {
                    color: 'rgb(204,204,204)',
                    opacity: 0.5,
                },
            },
        ],
        layout: {
            title: 'Sales Report 2023',
            barmode: 'group',
            autosize: true, // makes the chart responsive
        },
    }
}
