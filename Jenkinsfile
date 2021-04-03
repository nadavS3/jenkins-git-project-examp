pipeline 
{
    agent none
    stages
    {
        stage('Build on master')
          {
            agent {label 'master'}   
            steps
               {
                sh 'echo "Hello World from master"'
                sh 'npm i'
                script{
                def buildResults = sh 'npm run build'
                if (buildResults == 'Failed')
                    {
                    error "build failed"
                    }
                }
               }
          }
         stage('Build on nadavs leptop')
         {
             agent {label 'nadavs-leptop'}   
              steps
              {
                  sh 'echo "build was successfull"'
              }
         }
     }
       
}
