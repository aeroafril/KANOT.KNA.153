const validate = (skema) => (req, res, next) => {
    if(skema.params){
        req.params = skema.params.parse(req.params);
    }

    if(skema.query){
        Object.defineProperty(req, 'query', {
            value: skema.query.parse(req.query),
            writable: true,
            configurable: true,
            enumerable: true
        });
    }
    
    if(skema.body){
        const hasil = skema.body.parse(req.body ?? {});
        req.body = Object.fromEntries(Object.entries(hasil).filter(([, nilai]) => nilai !== undefined));
    }
    next();
};

module.exports = validate;