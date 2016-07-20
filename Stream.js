var Stream = function (data) {
    this.data = data;
    this.len = this.data.length;
    this.pos = 0;

    this.readByte = function () {
        if (this.pos >= this.data.length) {
            throw new Error('Attempted to read past end of stream.');
        }
        if (data instanceof Uint8Array)
            return data[this.pos++];
        else
            return data.charCodeAt(this.pos++) & 0xFF;
    };

    this.readBytes = function (n) {
        var bytes = [];
        for (var i = 0; i < n; i++) {
            bytes.push(this.readByte());
        }
        return bytes;
    };

    this.read = function (n) {
        var s = '';
        for (var i = 0; i < n; i++) {
            s += String.fromCharCode(this.readByte());
        }
        return s;
    };

    this.readUnsigned = function () { // Little-endian.
        var a = this.readBytes(2);
        return (a[1] << 8) + a[0];
    };
};

module.exports = Stream;
