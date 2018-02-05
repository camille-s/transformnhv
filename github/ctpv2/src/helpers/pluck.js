module.exports.pluck = function(array, key) {
    // return array.map((d) => d.title; );
    console.log(array);
    return array.map(function(d) {
        return d[key];
    });
};
