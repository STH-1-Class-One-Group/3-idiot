// ─────────────────────────────────────────────────────────────
// cartService.ts
// DB 로직만 모아두는 "서비스 레이어" 파일.
//
// [왜 분리하나요?]
// 컴포넌트(UI)와 DB 코드를 섞으면 → 나중에 수정할 때 두 군데를 동시에 건드려야 함.
// 서비스로 분리하면:
//   - 컴포넌트는 "어떻게 보여줄지"만 담당
//   - 서비스는 "DB와 어떻게 소통할지"만 담당
//   - 재사용·테스트가 쉬워짐
// ─────────────────────────────────────────────────────────────
import { supabase } from '../../../api/supabaseClient';
import type { AddToCartPayload, CartItemWithFood } from '../types/cart.types';

/**
 * 장바구니에 음식을 추가합니다. (Upsert 방식)
 *
 * [Upsert 원리]
 * "없으면 INSERT, 있으면 quantity + 1 UPDATE"
 * → DB에 있는지 먼저 조회한 뒤, 결과에 따라 분기합니다.
 * → 이 방식이 원리를 이해하기 가장 명확합니다.
 */
export async function addToCart(payload: AddToCartPayload): Promise<void> {
  // 1단계: 현재 로그인한 유저 확인
  //   로그인하지 않은 사람이 장바구니를 쓰면 안 되므로 가장 먼저 체크.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('로그인이 필요합니다.');
  }

  // 2단계: 이미 장바구니에 있는지 조회
  //   .single() → 결과가 없으면 null 반환 (에러가 아님!)
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', user.id)
    .eq('food_id', payload.food_id)
    .maybeSingle(); // .single() 대신 maybeSingle() → 없어도 에러 안 남

  if (existing) {
    // 3-A: 이미 있는 경우 → quantity만 +1
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + 1 })
      .eq('id', existing.id);

    if (error) throw error;
  } else {
    // 3-B: 처음 담는 경우 → 새 행 INSERT
    const { error } = await supabase.from('cart_items').insert({
      user_id: user.id,
      food_id: payload.food_id,       // number 타입
      quantity: payload.quantity ?? 1, // 생략 시 1
    });

    if (error) throw error;
  }
}

/**
 * 현재 유저의 장바구니 목록을 food_items 정보와 함께 가져옵니다.
 *
 * [왜 JOIN하나요?]
 * cart_items만 가져오면 food_id(숫자)밖에 없어서 이름·가격을 알 수 없음.
 * Supabase .select('*, food_items(...)')로 한 번에 JOIN해서 가져옴.
 */
export async function getCartItems(): Promise<CartItemWithFood[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select(
      `
      *,
      food_items (
        id,
        name,
        price,
        image_url,
        calories
      )
    `
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as CartItemWithFood[];
}

/**
 * 장바구니에서 특정 아이템을 삭제합니다.
 * @param cartItemId - cart_items 테이블의 id (UUID 문자열)
 */
export async function removeFromCart(cartItemId: string): Promise<void> {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);

  if (error) throw error;
}

/**
 * 장바구니를 모두 비웁니다. (주문 완료 후 사용)
 */
export async function clearCart(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('로그인이 필요합니다.');

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}

/**
 * 장바구니 아이템의 수량을 업데이트합니다.
 * @param targetId - cart_items 테이블의 id (UUID 문자열)
 * @param newQuantity - 새로운 수량 (1 이상이어야 함)
 */
export async function updateQuantity(targetId: string, newQuantity: number): Promise<void> {
  if (newQuantity < 1) {
    throw new Error('수량은 1 이상이어야 합니다.');
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity: newQuantity })
    .eq('id', targetId);

  if (error) throw error;
}
