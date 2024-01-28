import { FormatDatePipe } from 'src/shared/common/pipes/format-date.pipe'

describe('FormatDatePipe', () => {
    it('create an instance', () => {
        const pipe = new FormatDatePipe()
        expect(pipe).toBeTruthy()
    })
})
