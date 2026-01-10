# NestJS + Docker + Kubernetes – Full Step-by-Step Guide

This document explains **how to create a NestJS project**, **Dockerize it**, **deploy it to Kubernetes**, and understand its architecture flow, request handling, scaling, and lifecycle management.

---

## 1. Prerequisites

Make sure you have these installed:

* Node.js (v18 or later)
* npm (comes with Node.js)
* Docker
* Kubernetes (Minikube or Docker Desktop Kubernetes)
* kubectl

Check installations:

```bash
node -v
npm -v
docker -v
kubectl version --client
```

---

## 2. Create a New NestJS Project

Install NestJS CLI:

```bash
npm install -g @nestjs/cli
```

Create the project:

```bash
nest new nodejs-k8s
```

Choose npm as the package manager.

Move to the project folder:

```bash
cd nodejs-k8s
```

Start the application:

```bash
npm run start:dev
```

Visit:

```
http://localhost:3000
```

You should see **"Hello World!"**

---

## 3. Build the Project

```bash
npm run build
```

Creates `dist/` folder.

---

## 4. Create Dockerfile

Create `Dockerfile` in project root:

```Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

---

## 5. Build and Run Docker Image

```bash
docker build -t your-docker-username/nodejs-k8s:1.0 .
```

Run locally:

```bash
docker run -p 3000:3000 your-docker-username/nodejs-k8s:1.0
```

Test in browser:

```
http://localhost:3000
```

---

## 6. Push Image to Docker Hub

```bash
docker login
docker push your-docker-username/nodejs-k8s:1.0
```

---

## 7. Create Kubernetes Manifests

Create folder `k8s/` and files `deployment.yaml` & `service.yaml`

### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-k8s
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nodejs-k8s
  template:
    metadata:
      labels:
        app: nodejs-k8s
    spec:
      containers:
        - name: nodejs-k8s
          image: your-docker-username/nodejs-k8s:1.0
          ports:
            - containerPort: 3000
```

### service.yaml

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nodejs-k8s
spec:
  selector:
    app: nodejs-k8s
  ports:
    - port: 80
      targetPort: 3000
  type: LoadBalancer
```

---

## 8. Deploy to Kubernetes

```bash
kubectl apply -f k8s/
kubectl get all
```

Access app (Minikube):

```bash
minikube service nodejs-k8s
```

---

## 9. Stop and Cleanup

```bash
kubectl delete -f k8s/
kubectl get all
```

Force delete Pod if stuck:

```bash
kubectl delete pod <pod-name> --grace-period=0 --force
```

---

## 10. Architecture & Request Flow

### Flow Summary

1. User sends HTTP request
2. Request reaches Kubernetes Service
3. Service forwards request to one of the Pods
4. Pod runs Docker container
5. Container executes NestJS app
6. Response sent back to user

### Scaling & Management

* Kubernetes can run multiple Pods
* Service load-balances requests
* Crashed Pods are automatically recreated
* Scaling does not affect users

### ASCII Diagram

```
                   ┌──────────────────┐
                   │      User        │
                   │  (Browser / API) │
                   └────────┬─────────┘
                            │ HTTP Request
                            ▼
              ┌─────────────────────────────┐
              │ Kubernetes Service           │
              │ (LoadBalancer / ClusterIP)  │
              └────────┬──────────┬─────────┘
                       │          │
           Load Balance │          │ Load Balance
                       ▼          ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ Pod #1            │  │ Pod #2            │
        │ Docker Container │  │ Docker Container │
        │ NestJS App       │  │ NestJS App       │
        └────────┬─────────┘  └────────┬─────────┘
                 │                      │
                 └──────────┬───────────┘
                            ▼
                    HTTP Response
```

### Scaling Example

```bash
kubectl scale deployment nodejs-k8s --replicas=3
```

* 3 Pods created
* Service automatically distributes traffic
* High availability

### Self-Healing

* Pod crashes → Kubernetes detects → New Pod created → Traffic continues

---

## 11. Conclusion

This setup demonstrates:

* Creating NestJS app
* Dockerizing it
* Deploying on Kubernetes
* Handling requests, scaling, and self-healing

Suitable for **learning cloud-native architecture** or **real-world deployment practice**.

---

Happy coding 🚀
