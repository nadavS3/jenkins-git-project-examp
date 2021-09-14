import { DatabaseType } from 'typeorm'

const aws = require('aws-sdk')

export type connector = {
  username: string,
  password: string,
  engine: DatabaseType,
  host: string,
  port: number,
  dbname: string
}

export type secret = {
  digitalOrientationMysql: connector;
  digitalOrientationMongo: connector;
};
// var secretObj: secret;

export const getSecrets = async (secretName: string[]) : Promise<secret> => {
  const secretManager = new AwsSecretsManager({
    region: 'eu-west-1'
  })
  const secretValue: secret = await secretManager.getSecretValue(secretName)
  console.log (JSON.stringify(secretValue, null, 2))
  return (secretValue)
}

// export const getSecretVal = () =>{return secretObj};

class AwsSecretsManager {
  awsSecretsManager: any;
  constructor (SecretsManagerOptions: any) {
    this.awsSecretsManager = new aws.SecretsManager(SecretsManagerOptions)
  }

  async getSecretValue (secretList: string[]) {
    let secretValue: string = "{"
    let buffer, decodedBinarySecret, value
    let index = 0
    for (const secretId of secretList){
      try {
        const data = await this.awsSecretsManager.getSecretValue({
          SecretId: secretId
        }).promise()
        if ('SecretString' in data) {
          value = data.SecretString;
        } else {
          buffer = Buffer.from(data.SecretBinary, 'base64')
          decodedBinarySecret = buffer.toString('ascii')
          value = decodedBinarySecret
        }
        secretValue += '"'+ secretId+'": '+value
        if (index < secretList.length-1) secretValue += ','
        index++
      } catch (err) {
        console.log('SecretManager err:', err)
        throw err
      }
 
    };
    secretValue += "}"
    return  JSON.parse(secretValue);
  }
}


