import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'formatTime',
})
export class FormatTimePipe implements PipeTransform {
    transform(value: any): any {
        const date = new Date(value)
        const hours = date.getHours()
        const minutes = date.getMinutes()

        // Pad single digit hour and minute with leading zero
        const formattedHour = hours < 10 ? `0${hours}` : hours
        const formattedMinute = minutes < 10 ? `0${minutes}` : minutes

        return `${formattedHour}:${formattedMinute}`
    }
}
