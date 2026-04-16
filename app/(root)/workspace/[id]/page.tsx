import { WorkSpaceView } from "@/modules/workspace/ui/view/workspace-view"

interface Props{
    params:Promise<{id:string}>
}
const WorkSpaceID = async ({params}:Props) => {
  const {id} = (await params)
    return (
    <>
     <WorkSpaceView id={id}/>   
    </>
  )
}

export default WorkSpaceID