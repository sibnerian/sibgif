var lzwDecode = function (minCodeSize, data) {
    var pos = 0; // Maybe this streaming thing should be merged with the Stream?
    var readCode = function (size) {
        var code = 0;
        for (var i = 0; i < size; i++) {
            if (data[pos >> 3] & (1 << (pos & 7))) {
                code |= 1 << i;
            }
            pos++;
        }
        return code;
    };


    var clearCode = 1 << minCodeSize;
    var eoiCode = clearCode + 1;

    var codeSize = minCodeSize + 1;

    var outputBlockSize = 4096,
        bufferBlockSize = 4096;

    var output = new Uint8Array(outputBlockSize),
        buffer = new Uint8Array(bufferBlockSize),
        dict = [];

    var bufferOffset = 0,
        outputOffset = 0;


    var fill = function () {
        for (var i = 0; i < clearCode; i++) {
            dict[i] = new Uint8Array(1);
            dict[i][0] = i;
        }
        dict[clearCode] = new Uint8Array(0);
        dict[eoiCode] = null;
    }
    var clear = function () {
        var keep = clearCode + 2;
        dict.splice(keep, dict.length - keep);
        codeSize = minCodeSize + 1;
        bufferOffset = 0;
    };

    // Block allocators, double block size each time
    var enlargeOutput = function() {
        var outputSize = output.length + outputBlockSize;
        var newoutput = new Uint8Array(outputSize);
        newoutput.set(output);
        output = newoutput;
        outputBlockSize = outputBlockSize << 1;
    }
    var enlargeBuffer = function() {
        var bufferSize = buffer.length + bufferBlockSize;
        var newbuffer = new Uint8Array(bufferSize);
        newbuffer.set(buffer);
        buffer = newbuffer;
        bufferBlockSize = bufferBlockSize << 1;
    }

    var pushCode = function(code, last) {
        var newlength = dict[last].byteLength + 1;
        while (bufferOffset + newlength > buffer.length) enlargeBuffer();
        var newdict = buffer.subarray(bufferOffset, bufferOffset + newlength);
        newdict.set(dict[last]);
        newdict[newlength-1] = dict[code][0];
        bufferOffset += newlength;
        dict.push(newdict);
    }

    var code;
    var last;

    fill();

    while (true) {
        last = code;
        code = readCode(codeSize);

        if (code === clearCode) {
            clear();
            continue;
        }
        if (code === eoiCode) break;

        if (code < dict.length) {
            if (last !== clearCode) {
                pushCode(code, last);
            }
        }
        else {
            if (code !== dict.length) throw new Error('Invalid LZW code.');
            pushCode(last, last);
        }

        var newsize = dict[code].length;
        while (outputOffset + newsize > output.length) enlargeOutput();
        output.set(dict[code], outputOffset);
        outputOffset += newsize;

        if (dict.length === (1 << codeSize) && codeSize < 12) {
            // If we're at the last code and codeSize is 12, the next code will be a clearCode, and it'll be 12 bits long.
            codeSize++;
        }
    }

    // I don't know if this is technically an error, but some GIFs do it.
    //if (Math.ceil(pos / 8) !== data.length) throw new Error('Extraneous LZW bytes.');
    return output.subarray(0, outputOffset);
};

module.exports = lzwDecode;
