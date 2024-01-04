import { FormatTimePipe } from 'src/shared/common/pipes/format-time.pipe'

describe('FormatTimePipe', () => {
    it('create an instance', () => {
        const pipe = new FormatTimePipe()
        expect(pipe).toBeTruthy()
    })
})
