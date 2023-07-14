import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
    transform(value: any): any {
        const date = new Date(value)
        const year = date.getFullYear()
        const month = date.getMonth() + 1 // Months are zero indexed
        const day = date.getDate()

        // Pad single digit month and day with leading zero
        const formattedMonth = month < 10 ? `0${month}` : month
        const formattedDay = day < 10 ? `0${day}` : day

        return `${year}-${formattedMonth}-${formattedDay}`
    }
}
