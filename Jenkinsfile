pipeline 
{
    agent none
    stages
    {
         boolean testPassed = true
        
        stage('Build on master')
          {
            agent {label 'master'}   
            steps
               {
                sh 'echo "Hello World from master"'
                sh 'npm i'
                def buildResults = sh 'npm run build'
                if (buildResults == 'Failed')
                    {
                    error "build failed"
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
