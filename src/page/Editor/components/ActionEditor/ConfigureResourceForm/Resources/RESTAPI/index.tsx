import { forwardRef, useState } from "react"
import { useForm, Controller, SubmitHandler } from "react-hook-form"
import { Input } from "@illa-design/input"
import { InputTag } from "@illa-design/input-tag"
import { Checkbox } from "@illa-design/checkbox"
import { Divider } from "@illa-design/divider"
import { Select, Option } from "@illa-design/select"
import { ERROR_REQUIRED_MESSAGE } from "@/page/Editor/constants"
import { useDispatch, useSelector } from "react-redux"
import { selectAllResource } from "@/redux/action/resource/resourceSelector"
import { resourceActions } from "@/redux/action/resource/resourceSlice"
import { v4 as uuidV4 } from "uuid"
import { RESTAPIFormProps, RESTAPIFormValues, Params } from "./interface"
import {
  formCss,
  gridContainerCss,
  labelTextCss,
  requiredLabelTextCss,
  applyGridColIndex,
  descriptionCss,
  splitLineCss,
  groupTitleCss,
  checkboxCss,
  errorMessageCss,
  gridRowContainerCss,
  gridRowCenterItemCss,
} from "../style"
import {
  inputTagSmallSizeCss,
  labelAlignSelfFlexStartCss,
  topZIndexCss,
} from "./style"
import { ParamList } from "./ParamList"
import { BasicAuth, OAuth2 } from "./Authentication"

const EmptyField: Params = { key: "", value: "" }

export const RESTAPI = forwardRef<HTMLFormElement, RESTAPIFormProps>(
  (props, ref) => {
    const { resourceId } = props
    const dispatch = useDispatch()
    const resourceConfig = useSelector(selectAllResource).find(
      (i) => i.id === resourceId,
    )
    const {
      handleSubmit,
      control,
      watch,
      formState: { errors },
    } = useForm<RESTAPIFormValues>({
      mode: "onBlur",
      defaultValues: (resourceConfig?.config as RESTAPIFormValues) || {
        URLParameters: [EmptyField],
        Headers: [EmptyField],
        ExtraBodyValues: [EmptyField],
        ForwardAllCookies: false,
        Authentication: "none",
        UseClientCredentialsAuth: false,
        ShareOAuth2CredentialsBetweenUsers: false,
        EnableAuthVerificationEndpoint: false,
      },
    })

    const [authType, setAuthType] = useState("none")

    const onSubmit: SubmitHandler<RESTAPIFormValues> = (data) => {
      dispatch(
        resourceActions.addResourceItemReducer({
          id: uuidV4(),
          name: data.Name,
          type: "REST API",
          config: data,
        }),
      )
    }

    const renderAuthConfig = () => {
      if (authType === "basic") {
        return <BasicAuth control={control} watch={watch} />
      }

      if (authType === "OAuth2") {
        return <OAuth2 control={control} watch={watch} />
      }

      return null
    }

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit(onSubmit)}
        css={[formCss, gridContainerCss]}
      >
        <div css={gridRowContainerCss}>
          <label css={requiredLabelTextCss}>Name</label>
          <Controller
            render={({ field }) => (
              <Input
                {...field}
                placeholder='i.e."Users DB(readonly)" or "Internal Admin API"'
                error={!!errors.Name}
                maxLength={200}
              />
            )}
            rules={{
              required: ERROR_REQUIRED_MESSAGE,
            }}
            control={control}
            name="Name"
          />
          {errors.Name && (
            <div css={[errorMessageCss, applyGridColIndex(2)]}>
              {errors.Name.message}
            </div>
          )}
          <dd css={[applyGridColIndex(2), descriptionCss]}>
            The name for resource when creating queries in the ILLA.
          </dd>
        </div>

        <Divider css={splitLineCss} />

        <h4 css={groupTitleCss}>GENERAL</h4>

        <div css={gridRowContainerCss}>
          <label css={labelTextCss}>Base URL</label>
          <Controller
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Use the absolute URL (e.g https://example.com)"
                maxLength={200}
              />
            )}
            control={control}
            name="BaseURL"
          />
        </div>

        <div css={gridRowContainerCss}>
          <label css={[labelTextCss, labelAlignSelfFlexStartCss]}>
            URL Parameters
          </label>
          <ParamList control={control} name={"URLParameters"} />
        </div>

        <div css={gridRowContainerCss}>
          <label css={[labelTextCss, labelAlignSelfFlexStartCss]}>
            Headers
          </label>
          <ParamList control={control} name={"Headers"} />
        </div>

        <div css={gridRowContainerCss}>
          <label css={[labelTextCss, labelAlignSelfFlexStartCss]}>
            Extra Body Values
          </label>
          <ParamList control={control} name={"ExtraBodyValues"} />
          <dd css={[applyGridColIndex(2), descriptionCss]}>
            Extra body values are not passed for GET or HEAD requests
          </dd>
        </div>

        <div css={gridRowContainerCss}>
          <div css={[gridRowContainerCss, gridRowCenterItemCss]}>
            <label css={labelTextCss}>
              List Of Cookies To
              <br /> Forward
            </label>
            <Controller
              render={({ field }) => (
                <InputTag
                  {...field}
                  size={"small"}
                  _css={inputTagSmallSizeCss}
                />
              )}
              control={control}
              name="CookiesToForward"
            />
          </div>
          <Controller
            render={({ field }) => (
              <Checkbox css={[applyGridColIndex(2), checkboxCss]} {...field}>
                Forward All Cookies
              </Checkbox>
            )}
            control={control}
            name="ForwardAllCookies"
          />
        </div>

        <div css={gridRowContainerCss}>
          <label css={labelTextCss}>Authentication</label>
          <Controller
            render={() => (
              <Select
                size={"small"}
                onChange={setAuthType}
                value={authType}
                triggerProps={{ _css: topZIndexCss }}
              >
                <Option value={"none"}>None</Option>
                <Option value={"basic"}>Basic Auth</Option>
                <Option value={"OAuth2"}>OAuth 2.0</Option>
              </Select>
            )}
            control={control}
            name="Authentication"
          />
        </div>

        {renderAuthConfig()}
      </form>
    )
  },
)
