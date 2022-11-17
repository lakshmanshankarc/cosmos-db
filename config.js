/**
 * This Configuration file will contains all the Secret information you need to connect to the Azure CosmosDB
 * 
 * Please Change the endpoint with your cosmos DB endpoint and all other options with the respective ones
 * 
 * Do not move this file because this will is automatically imported in KPRContacts file Otherwise it may result in Errors
 */
var config={
    endpoint:"You_endpoint_here",
    key:"Your_Secret_key_here",
    partionkeys:{
        ids:[{kind:'Hash',paths:["/api/path/here"]}]
    },
    database:{
        id:'NameOfDatabase'
    },
    containers:{
        ids:['NameOfContainer']
    },
}


module.exports=config
