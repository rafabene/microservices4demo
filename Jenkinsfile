pipeline{
    agent{
        kubernetes(label: "jenkins-slave",
        yaml: """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: slave
    image: rafabene/jenkins-slave
    imagePullPolicy: IfNotPresent
    tty: true
    command: ["cat"]
    volumeMounts:
    - name: dockersock
      mountPath: /var/run/docker.sock
    - name: m2
      mountPath: /root/.m2
  volumes:
  - name: dockersock
    hostPath:
      path: /var/run/docker.sock
  - name: m2
    hostPath:
      path: /vagrant/m2
""")
    }
    triggers {
        cron('*/1 * * * *')
    }
    parameters {
        choice(name: 'JAVA_BUILD_TYPE', choices: ['JVM', 'Native'], description: 'Type of Quarkus build?')
    }
    triggers {
        pollSCM('*/1 * * * * ')
    }
    stages {
       stage ('SCM checkout'){
            steps{
                echo 'Checking out git repository'
                git poll: true, url: 'https://github.com/rafabene/microservices4demo', branch: 'master'
           }
        }
        stage ('Build both microservices'){
            parallel{
                stage('Build Hello Service'){
                    stages{
                        stage('Maven Build'){
                            steps{
                                container('slave'){
                                    echo 'Building Java application using maven'
                                    dir('hello'){
                                        sh 'mvn package -DskipTests'
                                    }
                                }
                            }
                        }
                        stage('Maven native build'){
                            when{
                                expression { params.JAVA_BUILD_TYPE == 'Native' }
                            }
                            steps{
                                container('slave'){
                                    echo 'Building native Java application using maven'
                                    dir('hello'){
                                        sh 'mvn package -Pnative -DskipTests'
                                    }
                                }
                            }
                        }
                        stage('Docker build'){
                            when{
                                expression { params.JAVA_BUILD_TYPE == 'JVM' }
                            }
                            steps{
                                container('slave'){
                                    echo "Building docker image"
                                    dir('hello'){
                                        sh 'docker build -f src/main/docker/Dockerfile.jvm -t rafabene/ms4demo:java .'
                                    }
                                }
                            }
                        }
                        stage('Docker build with native binary'){
                            when{
                                expression { params.JAVA_BUILD_TYPE == 'Native' }
                            }
                            steps{
                                container('slave'){
                                    echo "Building docker image using native binary"
                                    dir('hello'){
                                        sh 'docker build -f src/main/docker/Dockerfile.native -t rafabene/ms4demo:java .'
                                    }
                                }
                            }
                        }
                        stage('Execute Tests'){
                            steps{
                                container('slave'){
                                    echo "Run Tests"
                                    dir('hello'){
                                        sh 'mvn test'
                                    }
                                }
                            }
                        }
                    }
                }
                stage('Build Ola Service'){
                    stages{
                        stage('NPM Install'){
                            steps{
                                container('slave'){
                                    echo 'Running NPM Install'
                                    dir('ola'){
                                        sh 'npm install'
                                    }
                                }
                            }
                        }
                        stage('Docker build'){
                            steps{
                                container('slave'){
                                    echo "Building docker image"
                                    dir('ola'){
                                        sh 'docker build -t rafabene/ms4demo:node .'
                                    }
                                }
                            }
                        }
                        stage('Execute Tests'){
                            steps{
                                container('slave'){
                                    echo "Run Tests"
                                    dir('ola'){
                                        sh 'npm test'
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        stage('Integration tests'){
            steps{
                container('slave'){
                    echo "Here I execute the Integration tests"
                }
            }
        }
        stage('Human approval'){
            steps{
                input(message: 'Proceed to deployment?')
            }
        }
        stage('Deployment'){
            steps{
                container('slave'){
                    sh 'kubectl create namespace microservices || echo "Namespace \"microservices\" already exists"'
                    sh 'kubectl apply -f hello/kubernetes/deployment.yaml'
                    sh 'kubectl apply -f ola/kubernetes/deployment.yaml'
                    sh 'kubectl apply -f ola/kubernetes/deployment-v2.yaml'
                    sh 'kubectl apply -f hello/kubernetes/service.yaml'
                    sh 'kubectl apply -f ola/kubernetes/service.yaml'
                    sh 'kubectl apply -f hello/kubernetes/gateway.yaml -n microservices || echo "Istio not installed"'
                    sh """kubectl patch deployment hello -n microservices -p '{"spec":{"template":{"metadata":{"labels":{ "build": "${env.BUILD_NUMBER}"}}}}}' """
                    sh """kubectl patch deployment ola-v1 -n microservices -p '{"spec":{"template":{"metadata":{"labels":{ "build": "${env.BUILD_NUMBER}"}}}}}' """
                    sh """kubectl patch deployment ola-v2 -n microservices -p '{"spec":{"template":{"metadata":{"labels":{ "build": "${env.BUILD_NUMBER}"}}}}}' """
                }
            }
        }
    }
}