exports.labmdaResponse = body => ({                                               
    'statusCode': 200,                                                          
    'headers': {                                                                
        'Access-Control-Allow-Origin': '*'                                      
    },                                                                          
    'body': JSON.stringify(body),                                               
    'isBase64Encoded': false                                                    
});
