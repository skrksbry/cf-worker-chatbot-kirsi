# Cloudflare Warkers AI 와 OpenAI 를 이용한 Chat bot base
![image](https://skrksbry.synology.me/web_images/cchat.png)

이 프로젝트는 실제 개인 tech blog 에 적용한 chat bot 의 기반이 되는 소스 코드 입니다.

Prompt 및 RAG를 통해 원하는 응답을 할 수 있도록 조절하는것을 목적으로 하고 있습니다.

본 프로젝트에서는 Cloudflare Workers AI 와 Cloudflare의 Vectorize ( Vector DB ) 를 이용하고 있으며, Vector DB의 경우 Milvus나 Redis등으로 대체할 수 있습니다.

해당 예시에서는 Cloudflare의 Chat용 경량 모델인 `@cf/meta/llama-2-7b-chat-int8` 을 사용하고, Open AI 의 경량 모델인 `gpt-4o-mini` 를 사용하고 있습니다.

Cloudflare의 AI Model은 무료 사용량이 널널하나 text Embedding 을 위한 모델이 다국어를 지원하지 않고  `@cf/meta/llama-2-7b-chat-int8` 모델 역시 다국어를 지원하고 있지 않기 때문에 영문으로 테스트해야 합니다. ( 현 시점 Cloudflare에서는 다국어 Embedding 모델을 지원하지 않습니다 )


예시에서 Text Embedding은 실제 블로그 방문자의 질문을 통해 RAG(Retrieval-Augmented Generation) 를 수행하고 있기 때문에 Open AI의 Embedding 모델인 `text-embedding-3-small` 을 사용하였습니다.

이후에는 Deepseek R1 을 통해 추론모델 사용을 예정하고 있습니다.

## 주의할 점
이 소스코드는 바로 배포하여 동작하는 소스코드가 아님으로 사용하고자 하는 개개인의 목적에 알맞게 수정하여  사용해야 합니다.

작성 이후에는 `npx wrangler deploy` 를 통해 자신의 Cloudflare에 배포할 수 있습니다.

1.  Vectorize 사용시 Vector을 직접 배열로 전달해서는 안됩니다.
2. Prompt engineering 시 RAG를 통해 전달되는 내용은 항상 마지막에 위치하는 것이 좋습니다.( Cache hit 을 위해 ) 
3. Open AI의 Cache enable은 1024 Token 이후부터 발생합니다
4. Deepseek Cache 의 경우 항상 enable입니다. ( 따라서 이 경우 마지막에 있으면 비용을 유의미하게 절감할 수 있습니다. )

## 시작하기
Cloudflare 계정이 꼭 필요합니다
시작하기 전에 : node.js 21 이상의 LTS 버전을 설치하세요.

1. wrangler.jsonc 에서 Project Name 변경
2. Vectorize 사용시 wrangler.jsonc 에서 주석을 해제 ( 만약 다른 API endpoint를 사용할 예정이거나 단순 chat bot 만을 만드려고 한다면 무시하여도 됨 )
3. src/index.ts 에서 Open AI 를 이용할 예정이라면 API key 입력, 만약 CF 모델만 사용하고자 한다면 Open AI 와 관련된 스크립트를 주석처리 해야함.
4. `npx wrangler deploy` 를 통해 배포
5. 배포시 발생하는 브라우저 인증을 통해 cloudflare 로그인
6. cloudflare workers dashboard에서 workers의 링크를 확인하고 접속하여( 혹은 workers 편집창으로 이동하면 우측에서 url 조작 가능 ) chatbot 에 request

## 실제 사용시 Workflow

실제 사용에서는 아래와 같이 사용하고 있습니다.

1. 유저 질문 발생 → Embedding을 통해 벡터 DB를 조회

2. 매칭된 벡터를 기반으로 원본 문서를 검색

3. 매칭 점수가 높으면 분할 저장된 원문을 전달

4. 매칭 점수가 애매하거나, 낮거나 혹은 제목에 해당하는 분할 벡터라면 원본(markdown 게시글)을 서버에서 요약하여 프롬프트에 포함

## 참고한 문서
[Cloudflare Vectorize API](https://developers.cloudflare.com/api/go/resources/vectorize/)

[Cloudflare Workers Document](https://developers.cloudflare.com/workers/)


[Openai API Document](https://platform.openai.com/docs/api-reference/)
