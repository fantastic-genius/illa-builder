import { FC, useMemo, useState } from "react"
import { v4 as uuidV4 } from "uuid"
import { Button } from "@illa-design/button"
import { Select, Option } from "@illa-design/select"
import { Divider } from "@illa-design/divider"
import { CaretRightIcon, MoreIcon, PenIcon } from "@illa-design/icon"
import { Dropdown } from "@illa-design/dropdown"
import { Menu } from "@illa-design/menu"
import { useDispatch, useSelector } from "react-redux"
import { selectAllActionItem } from "@/redux/action/actionList/actionListSelector"
import { selectAllResource } from "@/redux/action/resource/resourceSelector"
import { actionListActions } from "@/redux/action/actionList/actionListSlice"
import { ActionEditorPanelProps } from "./interface"
import {
  containerCss,
  headerCss,
  actionCss,
  fillingCss,
  actionSelectCss,
  triggerSelectCss,
  resourceSelectCss,
  editIconCss,
  moreBtnCss,
  sectionTitleCss,
  resourceBarCss,
  panelScrollCss,
  moreBtnMenuCss,
  duplicateActionCss,
  deleteActionCss,
} from "./style"
import { TitleInput } from "./TitleInput"
import { ResourcePanel } from "./ResourcePanel"
import { applyIllaColor } from "@/page/Editor/components/ActionEditor/style"

const { Item: MenuItem } = Menu

export const ActionEditorPanel: FC<ActionEditorPanelProps> = (props) => {
  const {
    activeActionItemId,
    onEditResource,
    onCreateResource,
    onDuplicateActionItem,
    onDeleteActionItem,
  } = props

  const dispatch = useDispatch()
  const [resourceId, setResourceId] = useState("")
  const [moreBtnMenuVisible, setMoreBtnMenuVisible] = useState(false)

  const actionItems = useSelector(selectAllActionItem)
  const resourceList = useSelector(selectAllResource)
  const activeActionItem = useMemo(() => {
    if (!activeActionItemId) {
      return null
    }

    return actionItems.find((action) => action.id === activeActionItemId)
  }, [actionItems, activeActionItemId])
  const actionItemsNameSet = useMemo(() => {
    return new Set(actionItems.map((i) => i.name))
  }, [actionItems])

  const triggerOptions = [
    {
      label: "Run action only when manually triggered",
      value: 0,
    },
    {
      label: "Run action automatically when inputs change",
      value: 1,
    },
  ]

  function createResource() {
    onCreateResource && onCreateResource()
  }

  function editResource() {
    resourceId && onEditResource && onEditResource(resourceId)
  }

  function handleAction(key: string) {
    setMoreBtnMenuVisible(false)

    if (key === "duplicate") {
      duplicateActionItem()
    } else if (key === "delete") {
      deleteActionItem()
    }
  }

  function duplicateActionItem() {
    if (activeActionItem) {
      const { type } = activeActionItem
      const id = uuidV4()

      dispatch(
        actionListActions.addActionItemReducer({
          id,
          type,
          name: generateName(type),
          status: Math.random() > 0.5 ? "warning" : "",
        }),
      )

      onDuplicateActionItem(id)
    }
  }

  function deleteActionItem() {
    activeActionItem &&
      dispatch(actionListActions.removeActionItemReducer(activeActionItemId))

    onDeleteActionItem(activeActionItemId)
  }

  function generateName(type: string) {
    const length = actionItems.filter((i) => i.type === type).length
    const prefix = type

    const getUniqueName = (length: number): string => {
      const name = `${prefix}${length + 1}`

      if (actionItemsNameSet.has(name)) {
        return getUniqueName(length + 1)
      }

      return name
    }

    return getUniqueName(length)
  }

  const moreActions = (
    <Menu onClickMenuItem={handleAction} css={moreBtnMenuCss}>
      <MenuItem
        key={"duplicate"}
        title={"Duplicate"}
        css={duplicateActionCss}
      />
      <MenuItem key={"delete"} title={"Delete"} css={deleteActionCss} />
    </Menu>
  )

  return (
    <div css={containerCss}>
      <header css={headerCss}>
        <TitleInput activeActionItem={activeActionItem} />
        <span css={fillingCss} />
        <Dropdown
          dropList={moreActions}
          trigger={"click"}
          popupVisible={moreBtnMenuVisible}
          onVisibleChange={setMoreBtnMenuVisible}
          triggerProps={{
            clickOutsideToClose: true,
            closeOnClick: true,
            openDelay: 0,
            closeDelay: 0,
            showArrow: false,
          }}
        >
          <Button
            css={moreBtnCss}
            buttonRadius="8px"
            size="medium"
            leftIcon={<MoreIcon />}
            colorScheme="grayBlue"
          />
        </Dropdown>
        <Button
          buttonRadius="8px"
          size="medium"
          colorScheme="techPurple"
          backgroundColor={applyIllaColor("techPurple", "07")}
          textColor={applyIllaColor("techPurple", "01")}
          leftIcon={<CaretRightIcon />}
        >
          Run
        </Button>
      </header>
      <div css={panelScrollCss}>
        {activeActionItem && (
          <>
            <div css={[actionCss, resourceBarCss]}>
              <label css={sectionTitleCss}>Resource</label>
              <span css={fillingCss} />
              <Select
                options={triggerOptions}
                defaultValue={0}
                css={[actionSelectCss, triggerSelectCss]}
              />

              <Select
                css={[actionSelectCss, resourceSelectCss]}
                value={resourceId}
                onChange={setResourceId}
              >
                <Option onClick={createResource} isSelectOption={false}>
                  Create a new resource
                </Option>
                {resourceList &&
                  resourceList.map(({ id, name }) => (
                    <Option value={id} key={id}>
                      {name}
                    </Option>
                  ))}
              </Select>
              <div css={editIconCss} onClick={editResource}>
                <PenIcon />
              </div>
            </div>
            <Divider />
            <ResourcePanel resourceId={resourceId} />
          </>
        )}
      </div>
    </div>
  )
}

ActionEditorPanel.displayName = "ActionEditorPanel"
