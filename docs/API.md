# MANGANEX API Reference

Generated from OpenAPI 3.1.0 schema.

## Overview
Base URL: /api/v1 (with /health at root).
All data-bearing endpoints return standard response envelope with data_provenance.

## Centralized Authentication & RBAC

### POST /api/v1/auth/demo-login
Demo Login

**Request Body**: pplication/json payload


### POST /api/v1/auth/forgot-password
Forgot Password

**Request Body**: pplication/json payload


### POST /api/v1/auth/login
Login

**Request Body**: pplication/json payload


### POST /api/v1/auth/logout
Logout

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| authorization | header | any | False |  |


### GET /api/v1/auth/me
Get Current User

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| authorization | header | any | False |  |


### POST /api/v1/auth/refresh
Refresh Token

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| authorization | header | any | False |  |


### POST /api/v1/auth/register
Register User

**Request Body**: pplication/json payload


### POST /api/v1/auth/reset-password
Reset Password

**Request Body**: pplication/json payload


### GET /api/v1/auth/verify-email
Verify Email

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| token | query | string | True |  |


## Data Hub

### GET /api/v1/datasets
List Datasets


### POST /api/v1/datasets/knowledge/search
Knowledge Search

**Request Body**: pplication/json payload


### POST /api/v1/datasets/upload
Register Dataset

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| authorization | header | any | False |  |

**Request Body**: pplication/json payload


### GET /api/v1/datasets/{dataset_id}
Get Dataset Detail

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| dataset_id | path | string | True |  |


## Geological Intelligence

### GET /api/v1/geology/boreholes
Get All Boreholes


### GET /api/v1/geology/drill-targets
Get Recommended Drill Targets


### GET /api/v1/geology/prospectivity/grid
Get Grid Prospectivity


### GET /api/v1/geology/prospectivity/model-card
Get Prospectivity Model Card


### POST /api/v1/geology/prospectivity/score
Score Custom Prospect

**Request Body**: pplication/json payload


### GET /api/v1/geology/prospects
Get All Prospects


### GET /api/v1/geology/prospects/{prospect_id}/explain
Explain Prospect Ai

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| prospect_id | path | string | True |  |


## Global Intelligence Search

### GET /api/v1/search
Global Search

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| q | query | string | False | Search query string |


## Health

### GET /health
Health Check


## Hugging Face & RAG Knowledge Engine

### POST /api/v1/ai/chat
Ai Grounded Chat

**Request Body**: pplication/json payload


### POST /api/v1/ai/documents
Upload Document

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| authorization | header | any | False |  |

**Request Body**: pplication/json payload


### GET /api/v1/ai/documents
List Documents


### DELETE /api/v1/ai/documents/{doc_id}
Delete Document

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| doc_id | path | string | True |  |
| authorization | header | any | False |  |


### POST /api/v1/ai/search
Search Knowledge Base

**Request Body**: pplication/json payload


### GET /api/v1/ai/status
Get Ai Status


## Mine Optimization & Reports

### POST /api/v1/optimization/optimize
Optimize Mine Operations

**Request Body**: pplication/json payload


### POST /api/v1/optimization/reports/generate
Generate Mission Briefing Report

**Request Body**: pplication/json payload


## Mines Cadastre

### GET /api/v1/mines
Get All Mines


### GET /api/v1/mines/{mine_id}
Get Mine By Id

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| mine_id | path | string | True |  |


## Nexus AI Copilot

### POST /api/v1/nexus/chat
Chat With Nexus

**Request Body**: pplication/json payload


### POST /api/v1/nexus/chat/stream
Chat With Nexus Stream

**Request Body**: pplication/json payload


### GET /api/v1/nexus/sessions
List Sessions

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| user_id | query | any | False |  |


### POST /api/v1/nexus/sessions
Create Session

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| title | query | any | False |  |


### PATCH /api/v1/nexus/sessions/{session_id}
Update Session

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| session_id | path | string | True |  |
| authorization | header | any | False |  |

**Request Body**: pplication/json payload


### DELETE /api/v1/nexus/sessions/{session_id}
Delete Session

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| session_id | path | string | True |  |
| authorization | header | any | False |  |


### GET /api/v1/nexus/sessions/{session_id}/messages
Get Session Messages

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| session_id | path | string | True |  |


## Operational Risk & Shortfall Alerts

### GET /api/v1/alerts
Get Top Shortfall Risk Alerts


### GET /api/v1/alerts/
Get Top Shortfall Risk Alerts


## Operations & Simulation

### GET /api/v1/operations/risks
Get Risk Alerts


### POST /api/v1/operations/scenarios/simulate
Simulate Future Fork

**Request Body**: pplication/json payload


## Production Forecasting

### GET /api/v1/production/forecast/{mine_id}
Get Production Forecast

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| mine_id | path | string | True |  |
| horizon_days | query | integer | False |  |
| planned_downtime_hours | query | number | False |  |
| blasting_delay_hours | query | number | False |  |


### GET /api/v1/production/history/{mine_id}
Get Production History

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| mine_id | path | string | True |  |
| days | query | integer | False |  |


### POST /api/v1/production/simulate
Simulate Production Scenario

**Request Body**: pplication/json payload


### GET /api/v1/production/summary
Get Production Summary


## Real Weather & Soil Moisture Ingestion

### GET /api/v1/weather/summary
Get All Mines Weather Summary


### GET /api/v1/weather/{mine_id}
Get Mine Weather Telemetry

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| mine_id | path | string | True |  |


## Risk Intelligence

### GET /api/v1/risks/all
Get All Risks


### POST /api/v1/risks/predict
Predict Risk For Mine

**Request Body**: pplication/json payload


### GET /api/v1/risks/system-index
Get System Risk Index


## Root

### GET /
Root Status


## Satellite Intelligence

### GET /api/v1/satellite/anomalies
Get Spectral Anomalies


### GET /api/v1/satellite/composite/{mine_id}
Get Satellite Composite

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| mine_id | path | string | True |  |
| days | query | integer | False |  |


### GET /api/v1/satellite/observations/{mine_id}
Get Satellite Observations

| Parameter | In | Type | Required | Description |
|---|---|---|---|---|
| mine_id | path | string | True |  |
| days | query | integer | False |  |


### GET /api/v1/satellite/status
Get Satellite Status

