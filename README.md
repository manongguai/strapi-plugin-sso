# Strapi plugin sso

* github 仓库 
[https://github.com/manongguai/strapi-plugin-sso](https://github.com/manongguai/strapi-plugin-sso)

### ! 本项目仅作为个人开发，本人不承担任何法律责任，建议使用官方gold版本
### 目前仅支持 azure_ad_oauth2

### 配置示例

/config/plugins

```
   config:{
      AZUREAD_OAUTH_REDIRECT_URI: env('AZUREAD_OAUTH_REDIRECT_URI',`http://localhost:1337/sso/connect/azure_ad_oauth2`),
      AZUREAD_TENANT_ID: env('AZUREAD_TENANT_ID','f074dbeb-1cc3-4857-a3ba-17253091f5d3'),
      AZUREAD_OAUTH_CLIENT_ID: env('AZUREAD_OAUTH_CLIENT_ID','a8d3d937-2bd2-4dd5-812c-c280f8204511'),
      // AZUREAD_OAUTH_CLIENT_SECRET: '',
      AZUREAD_SCOPE:env('AZUREAD_SCOPE', ["user:email", "openid", "profile", "offline_access"]),
      ALLOW_PROVIDERS:['azure_ad_oauth2'] // 默认不开启SSO
    }

```

### !!! 使用的前提补丁@strapi/admin 的源码，添加admin.login.actions的注入区，否则会报错
### !!! 使用的前提补丁@strapi 源码版本指定为4.16.2 | 4.17.0 ，其他版本需要自动找到目标文件打补丁


@strapi/admin补丁方式：

- v4.16.2

1. 进入@strapi源码
2. 修改以下文件

* packages/core/admin/admin/src/App.tsx

```tsx 
+ import { ROUTES_EE as ROUTES_CE} from '../../ee/admin/src/constants'

注释掉 // const ROUTES_CE: StrapiRoute[] | null = null;

```

* packages/core/admin/admin/src/pages/Auth/components/Login.tsx

```tsx 
+ import { InjectionZone } from '../../../shared/components/InjectionZone'

-          {children}
+         {/* {children} */}
+         <InjectionZone area="admin.login.actions" />

```

* packages/core/admin/admin/src/shared/components/InjectionZone.tsx

```tsx 

const INJECTION_ZONES = {
  admin: {
    // Temporary injection zone, support for the react-tour plugin in foodadvisor
    tutorials: {
      links: [],
    },
 +  login:{
 +     actions: []
 +  },

    contentManager: {
    editView: { informations: [], 'right-links': [] },
    tutorials: {
      links: InjectionZoneComponent[];
    };
+    login:{
+     actions: InjectionZoneComponent[];
+   };
  };
  },


...


type InjectionZoneArea =
  | 'admin.tutorials.links'
+  | 'admin.login.actions'


...
-   return components.map((component) => <component.Component key={component.name} {...props} />);
+   return <>{components.map((component) => <component.Component key={component.name} {...props} />)}</>;


```


- v4.17.0

1. 进入@strapi源码
2. 修改以下文件

* packages/core/admin/admin/src/App.tsx

```tsx 
+ import { ROUTES_EE as ROUTES_CE} from '../../ee/admin/src/constants'

注释掉 // const ROUTES_CE: StrapiRoute[] | null = null;

```

* packages/core/admin/admin/src/pages/Auth/components/Login.tsx

```tsx 
+ import { InjectionZone } from '../../../components/InjectionZone'

-          {children}
+         {/* {children} */}
+         <InjectionZone area="admin.login.actions" />

```

* packages/core/admin/admin/src/components/InjectionZone.tsx

```tsx 

const INJECTION_ZONES = {
  admin: {
    // Temporary injection zone, support for the react-tour plugin in foodadvisor
    tutorials: {
      links: [],
    },
 +  login:{
 +     actions: []
 +  },
...

interface InjectionZones {
  admin: {
    tutorials: {
      links: InjectionZoneComponent[];
    };
 +   login: {
 +     actions: InjectionZoneComponent[];
 +   };
  };
  },


...


type InjectionZoneArea =
  | 'admin.tutorials.links'
+  | 'admin.login.actions'


...
-   return components.map((component) => <component.Component key={component.name} {...props} />);
+   return <>{components.map((component) => <component.Component key={component.name} {...props} />)}</>;


```



* 修改代码完成以后,cd 到 packages/core/admin ||  根目录
执行
```cmd
  npm run build
```

* 将packages/core/admin/dist  替换本项目的 @strapi/admin/dist     
