import { FormatTimePipe } from 'src/core/common/pipes/format-time.pipe'

describe('FormatTimePipe', () => {
    it('create an instance', () => {
        const pipe = new FormatTimePipe()
        expect(pipe).toBeTruthy()
    })
})
