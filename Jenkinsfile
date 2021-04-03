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
               }
          }
         stage('Build on nadavs leptop')
         {
             agent {label 'nadavs-leptop'}   
              steps
              {
                   sh 'echo "Hello World from nadavs leptop"'
              }
         }
     }
       
}
