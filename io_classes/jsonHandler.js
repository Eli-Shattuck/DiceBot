const fs = require('fs');

module.exports = {
    getObject: (filePath) => {
        try{
            let obj = JSON.parse(
                fs.readFileSync(
                    filePath, 
                    'utf-8', 
                    (err, data) => {
                        if (err) {
                            throw err;
                        }
                    }
                )
            );
            return obj;
        } catch(err) {
            //console.log(`The file at path ${filePath} was not found.`);
        }
    },

    saveObject: (filePath, object) => {
        try{
            let toWrite = JSON.stringify(object);
            fs.writeFileSync(
                filePath, 
                toWrite
            );
            return 0;
        } catch(err) {
            console.log('There was an error trying to write to the file.', err);
            return 1;
        }
    }
}