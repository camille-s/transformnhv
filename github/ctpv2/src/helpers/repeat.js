module.exports.repeat = function(n, block) {
    var output = '';
    for (var i = 1; i <= n; i++) {
        block.data.index = i;
        output += block.fn(this);
    }
    return output;
};
