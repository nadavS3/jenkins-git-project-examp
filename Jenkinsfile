node('master') {
  git url: 'https://github.com/nadavS3/jenkins-git-project-examp.git'
  def mvnHome = tool 'M3'
  sh "${mvnHome}/bin/mvn -B verify"
}
