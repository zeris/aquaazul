const moment = require('moment');
const emailRegex = require('email-regex');

let verificator = 
{
    Validate : function (format, parameters)
    {
        return new Promise(function(resolve, reject)
        {
            Object.keys(format).forEach(function(valueFormat)
            {
                if(parameters.hasOwnProperty(valueFormat))
                {
                    if(String(parameters[valueFormat]).length < format[valueFormat].minLength)
                    {
                        reject({
                            propertyName: valueFormat,
                            propertyValue: parameters[valueFormat],
                            expectedMinLength: format[valueFormat].minLength
                        });
                    }
                    
                    if(format.hasOwnProperty("maxLength"))
                    {
                        if(parameters[valueFormat].length > format[valueFormat].maxLength)
                        {
                            reject({
                                propertyName: valueFormat,
                                propertyValue: parameters[valueFormat],
                                expectedMaxLength: format[valueFormat].maxLength
                            });
                        }
                    }

                    switch(format[valueFormat].type)
                    {
                        case "date":
                            let date = moment(parameters[valueFormat], "YYYY-MM-DD", true)
                            if(!date.isValid() || date.format() === "Invalid Date")
                            {
                                reject({
                                    propertyName: valueFormat,
                                    propertyValue: parameters[valueFormat],
                                    expectedFormat: "YYYY-MM-DD"
                                });
                            }
                            if(format.hasOwnProperty("maxDate"))
                            {
                                let maxDate = moment(format[valueFormat], "YYYY-MM-DD").format();
                                if(date.format() > maxDate)
                                {
                                    reject({
                                        propertyName: valueFormat,
                                        propertyValue: parameters[valueFormat],
                                        expectedMaxDate: maxDate
                                    });
                                }
                            }
                            if(format.hasOwnProperty("minDate"))
                            {
                                let minDate = moment(format[valueFormat], "YYYY-MM-DD").format();
                                if(date.format() < minDate)
                                {
                                    reject({
                                        propertyName: valueFormat,
                                        propertyValue: parameters[valueFormat],
                                        expectedMinDate: minDate
                                    });
                                }
                            }
                        break;
                        case "object":
                            if((typeof parameters[valueFormat] !== "object") || (parameters[valueFormat] === null) || (Array.isArray(parameters[valueFormat])))
                            {
                                reject({
                                    propertyName: valueFormat,
                                    propertyValue: parameters[valueFormat],
                                    expectedDataType: "object"
                                })
                            }
                        break;
                        case "array":
                            if(!Array.isArray(parameters[valueFormat]))
                            {
                                reject({
                                    propertyName: valueFormat,
                                    propertyValue: parameters[valueFormat],
                                    expectedDataType: "array"
                                })
                            }
                        break;
                        case "email":
                            if(emailRegex().test(parameters[valueFormat]) === false)
                            {
                                reject({
                                    propertyName: valueFormat,
                                    propertyValue: parameters[valueFormat],
                                    expectedDateType: "email"
                                });
                            }
                        break;
                        case "bool":
                            if(typeof parameters[valueFormat] !== 'boolean')
                            {
                                reject({
                                    propertyName: valueFormat,
                                    propertyValue: parameters[valueFormat],
                                    expectedDateType: 'bool'
                                });
                            }
                        break;
                        case "int":
                            if(isNaN(parseInt(parameters[valueFormat])))
                            {
                                reject({
                                    propertyName: valueFormat,
                                    propertyValue: parameters[valueFormat],
                                    expectedDateType: "int"
                                });
                            }
                            else
                            {
                                if(!Number.isInteger(parseFloat(parameters[valueFormat])))
                                {
                                    reject({
                                        propertyName: valueFormat,
                                        propertyValue: parameters[valueFormat],
                                        expectedDateType: "int"
                                    });
                                }
                            }

                            if(format.hasOwnProperty("maxValue"))
                            {
                                let maxValue = format[maxValue]
                                if(parameters[valueFormat] > maxValue)
                                {
                                    reject({
                                        propertyName: valueFormat,
                                        propertyValue: parameters[valueFormat],
                                        expectedMaxValue: maxValue
                                    });
                                }
                            }

                            if(format.hasOwnProperty("minValue"))
                            {
                                let minValue = format[minValue]
                                if(parameters[valueFormat] > minValue)
                                {
                                    reject({
                                        propertyName: valueFormat,
                                        propertyValue: parameters[valueFormat],
                                        expectedMinValue: minValue
                                    });
                                }
                            }
                        break;
                        case "double":
                            if(isNaN(parseFloat(parameters[valueFormat])))
                            {
                                reject({
                                    propertyName: valueFormat,
                                    propertyValue: parameters[valueFormat],
                                    expectedDateType: "double"
                                });
                            }
        
                            if(format.hasOwnProperty("maxValue"))
                                {
                                    let maxValue = format[maxValue]
                                    if(parameters[valueFormat] > maxValue)
                                    {
                                        reject({
                                            propertyName: valueFormat,
                                            propertyValue: parameters[valueFormat],
                                            expectedMaxValue: maxValue
                                        });
                                    }
                                }

                                if(format.hasOwnProperty("minValue"))
                                {
                                    let minValue = format[minValue]
                                    if(parameters[valueFormat] > minValue)
                                    {
                                        reject({
                                            propertyName: valueFormat,
                                            propertyValue: parameters[valueFormat],
                                            expectedMinValue: minValue
                                        });
                                    }
                                }
                        break;
                    }
                }
                else
                {
                    if(format[valueFormat].minLength !== 0)
                    {
                        reject({
                            propertyName: valueFormat,
                            expected: "yes"
                        });
                    }
                }
            });
            resolve()
        });
    },
    ValidateArray : function(format, arrayObjects)
    {
        return new Promise(async function(resolve, reject)
        {
            for(let i = 0; i < arrayObjects.length; i++)
            {
                try
                {
                    await verificator.Validate(format, arrayObjects[i])
                    let j = i + 1;
                    if(j === arrayObjects.length)
                    {
                        resolve();
                    }
                }
                catch(e)
                {
                    reject(e);
                    return;
                }
            }
        });
    }
}

module.exports = verificator;